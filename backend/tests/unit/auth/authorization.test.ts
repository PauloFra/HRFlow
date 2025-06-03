import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, authorize, authorizeResourceOwner } from '../../../src/middleware/auth';
import { AppError, UserRole, RequestContext } from '../../../src/types';

describe('Authorization Middleware Security Tests', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      user: {
        userId: 'user123',
        employeeId: 'emp123',
        role: 'EMPLOYEE' as UserRole,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      } as RequestContext,
      params: {},
      path: '/test/path',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent')
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    nextFunction = jest.fn();
  });

  describe('authorize middleware', () => {
    it('should allow access when user has required role', () => {
      // Arrange
      const middleware = authorize('EMPLOYEE');
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should deny access when user lacks required role', () => {
      // Arrange
      const middleware = authorize('ADMIN');
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFunction.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(nextFunction.mock.calls[0][0].message).toBe('Insufficient permissions');
      expect(nextFunction.mock.calls[0][0].statusCode).toBe(403);
    });

    it('should require authentication', () => {
      // Arrange
      const middleware = authorize('EMPLOYEE');
      mockRequest.user = undefined;
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFunction.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(nextFunction.mock.calls[0][0].message).toBe('Authentication required');
      expect(nextFunction.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should allow access with any of the specified roles', () => {
      // Arrange
      const middleware = authorize('ADMIN', 'HR', 'EMPLOYEE');
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).not.toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('authorizeResourceOwner middleware', () => {
    beforeEach(() => {
      mockRequest.params = { userId: 'user123' };
    });

    it('should allow access when user owns the resource', () => {
      // Arrange
      const middleware = authorizeResourceOwner();
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should deny access when user does not own the resource', () => {
      // Arrange
      mockRequest.params = { userId: 'other-user' };
      const middleware = authorizeResourceOwner();
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFunction.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(nextFunction.mock.calls[0][0].message).toBe('Access denied to this resource');
      expect(nextFunction.mock.calls[0][0].statusCode).toBe(403);
    });

    it('should allow admin access to any resource', () => {
      // Arrange
      mockRequest.user!.role = 'ADMIN';
      mockRequest.params = { userId: 'other-user' };
      const middleware = authorizeResourceOwner();
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should allow HR access to any resource', () => {
      // Arrange
      mockRequest.user!.role = 'HR';
      mockRequest.params = { userId: 'other-user' };
      const middleware = authorizeResourceOwner();
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should allow specifying custom resource param name', () => {
      // Arrange
      mockRequest.params = { customId: 'user123' };
      const middleware = authorizeResourceOwner('customId');
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should require authentication', () => {
      // Arrange
      mockRequest.user = undefined;
      const middleware = authorizeResourceOwner();
      
      // Act
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);
      
      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFunction.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(nextFunction.mock.calls[0][0].message).toBe('Authentication required');
      expect(nextFunction.mock.calls[0][0].statusCode).toBe(401);
    });
  });
}); 