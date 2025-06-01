/**
 * Validation schemas for HRFlow backend using express-validator
 */

import { body, param, query } from 'express-validator';

// ================================
// Common validations
// ================================

export const idParam = param('id')
  .isUUID(4)
  .withMessage('Invalid ID format');

export const paginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
];

// ================================
// Authentication validations
// ================================

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('twoFactorCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Two-factor code must be 6 digits'),
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least 8 characters, including uppercase, lowercase, number and special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
];

// ================================
// Employee validations
// ================================

export const createEmployeeValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters with only letters, numbers and underscores'),
  body('role')
    .isIn(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'])
    .withMessage('Invalid role'),
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('First name must be 2-50 characters with only letters'),
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Last name must be 2-50 characters with only letters'),
  body('cpf')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)
    .withMessage('Invalid CPF format'),
  body('rg')
    .optional()
    .isLength({ min: 7, max: 20 })
    .withMessage('RG must be 7-20 characters'),
  body('birthDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid birth date'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
    .withMessage('Invalid gender'),
  body('personalEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid personal email'),
  body('phone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Phone must be in format (XX) XXXX-XXXX or (XX) XXXXX-XXXX'),
  body('cellPhone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Cell phone must be in format (XX) XXXX-XXXX or (XX) XXXXX-XXXX'),
  body('hireDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid hire date is required'),
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  body('departmentId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid department ID'),
  body('positionId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid position ID'),
  body('managerId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid manager ID'),
];

export const updateEmployeeValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('First name must be 2-50 characters with only letters'),
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Last name must be 2-50 characters with only letters'),
  body('personalEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid personal email'),
  body('phone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Phone must be in format (XX) XXXX-XXXX or (XX) XXXXX-XXXX'),
  body('cellPhone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Cell phone must be in format (XX) XXXX-XXXX or (XX) XXXXX-XXXX'),
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'])
    .withMessage('Invalid employee status'),
  body('departmentId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid department ID'),
  body('positionId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid position ID'),
  body('managerId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid manager ID'),
];

// ================================
// Time tracking validations
// ================================

export const timeEntryValidation = [
  body('type')
    .isIn(['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'])
    .withMessage('Invalid time entry type'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Accuracy must be a positive number'),
  body('locationId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid location ID'),
  body('justification')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Justification must be maximum 500 characters'),
];

// ================================
// Leave request validations
// ================================

export const leaveRequestValidation = [
  body('leaveType')
    .isIn(['VACATION', 'SICK_LEAVE', 'PERSONAL_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE', 'BEREAVEMENT', 'OTHER'])
    .withMessage('Invalid leave type'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
    .withMessage('Valid end date is required'),
  body('reason')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Reason must be maximum 1000 characters'),
  body('urgency')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid urgency level'),
];

export const approveLeaveRequestValidation = [
  body('approved')
    .isBoolean()
    .withMessage('Approved must be true or false'),
  body('rejectionReason')
    .if(body('approved').equals(false))
    .notEmpty()
    .withMessage('Rejection reason is required when denying request'),
];

// ================================
// News article validations
// ================================

export const newsArticleValidation = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be 5-200 characters'),
  body('content')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must be maximum 500 characters'),
  body('category')
    .isIn(['GENERAL', 'ANNOUNCEMENT', 'EVENT', 'POLICY', 'TRAINING', 'BENEFITS', 'SAFETY'])
    .withMessage('Invalid category'),
  body('targetRoles')
    .isArray({ min: 1 })
    .withMessage('At least one target role is required'),
  body('targetRoles.*')
    .isIn(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'])
    .withMessage('Invalid target role'),
  body('allowComments')
    .optional()
    .isBoolean()
    .withMessage('Allow comments must be true or false'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('Is pinned must be true or false'),
  body('publishedAt')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid publish date'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid expiry date'),
];

// ================================
// File upload validations
// ================================

export const fileUploadValidation = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file && !req.files) {
        throw new Error('File is required');
      }
      return true;
    }),
];

// ================================
// Validation result handler
// ================================

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
      })),
    });
  }
  next();
} 