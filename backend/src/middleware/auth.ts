/**
 * Authentication middleware for HRFlow backend
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '@/utils';
import { AppError, RequestContext, UserRole } from '@/types';
import { log } from '@/config/logger';

/**
 * Extended Request interface with user context
 */
export interface AuthenticatedRequest extends Request {
  user?: RequestContext;
}

/**
 * Authentication middleware - validates JWT token
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    const payload = verifyAccessToken(token);
    
    // Add user context to request
    req.user = {
      userId: payload.userId,
      employeeId: payload.employeeId,
      role: payload.role,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    next();
  } catch (error: any) {
    log.warn('Authentication failed', {
      error: error.message,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
    });

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token', 401));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired', 401));
    }

    next(error);
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = verifyAccessToken(token);
      
      req.user = {
        userId: payload.userId,
        employeeId: payload.employeeId,
        role: payload.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };
    }

    next();
  } catch (error: any) {
    // Log but don't fail the request
    log.debug('Optional authentication failed', {
      error: error.message,
      ipAddress: req.ip,
    });
    
    next();
  }
}

/**
 * Authorization middleware factory - checks user roles
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role!)) {
      log.warn('Authorization failed', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.path,
      });

      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}

/**
 * Resource ownership middleware - checks if user owns the resource
 */
export function authorizeResourceOwner(resourceUserIdParam: string = 'userId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceUserId = req.params[resourceUserIdParam];
    const currentUserId = req.user.userId;

    // Admin and HR can access any resource
    if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
      return next();
    }

    // User can only access their own resources
    if (resourceUserId !== currentUserId) {
      log.warn('Resource access denied', {
        userId: currentUserId,
        requestedResource: resourceUserId,
        endpoint: req.path,
      });

      return next(new AppError('Access denied to this resource', 403));
    }

    next();
  };
}

/**
 * Employee ownership middleware - checks if user owns the employee record
 */
export function authorizeEmployeeOwner(employeeIdParam: string = 'employeeId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceEmployeeId = req.params[employeeIdParam];
    const currentEmployeeId = req.user.employeeId;

    // Admin and HR can access any employee
    if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
      return next();
    }

    // User can only access their own employee record
    if (resourceEmployeeId !== currentEmployeeId) {
      log.warn('Employee resource access denied', {
        userId: req.user.userId,
        employeeId: currentEmployeeId,
        requestedEmployee: resourceEmployeeId,
        endpoint: req.path,
      });

      return next(new AppError('Access denied to this employee record', 403));
    }

    next();
  };
}

/**
 * Manager authorization middleware - checks if user is a manager of the employee
 */
export function authorizeManager(employeeIdParam: string = 'employeeId') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Admin and HR have access to all
    if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
      return next();
    }

    // Managers can access their subordinates
    if (req.user.role === 'MANAGER') {
      // TODO: Implement manager-subordinate relationship check
      // This would require a database query to check if the current user
      // is the manager of the requested employee
      return next();
    }

    // Regular employees can only access their own data
    const resourceEmployeeId = req.params[employeeIdParam];
    const currentEmployeeId = req.user.employeeId;

    if (resourceEmployeeId !== currentEmployeeId) {
      return next(new AppError('Access denied', 403));
    }

    next();
  };
} 