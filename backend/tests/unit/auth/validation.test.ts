import { describe, expect, it } from '@jest/globals';
import { Request, Response } from 'express';
import { 
  loginValidation, 
  changePasswordValidation, 
  refreshTokenValidation 
} from '../../../src/validations';
import { validationResult } from 'express-validator';

describe('Authentication Input Validation Security Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {}
    } as Partial<Request>;
    
    mockResponse = {} as Partial<Response>;
  });

  describe('Login Validation', () => {
    it('should validate email format', async () => {
      // Test invalid email
      mockRequest.body = { 
        email: 'invalid-email',
        password: 'validPassword123' 
      };
      
      // Run all validators
      for (const validation of loginValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const errors = validationResult(mockRequest);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(e => e.path === 'email')).toBe(true);

      // Test valid email
      mockRequest.body = {
        email: 'valid@example.com',
        password: 'validPassword123'
      };
      
      // Clear previous validation errors
      (mockRequest as any)._validationErrors = [];
      
      // Run all validators
      for (const validation of loginValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const validErrors = validationResult(mockRequest);
      expect(validErrors.isEmpty()).toBe(true);
    });

    it('should validate password strength', async () => {
      // Test weak password
      mockRequest.body = { 
        email: 'valid@example.com',
        password: 'weak' 
      };
      
      // Run all validators
      for (const validation of loginValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const errors = validationResult(mockRequest);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(e => e.path === 'password')).toBe(true);

      // Test strong password
      mockRequest.body = {
        email: 'valid@example.com',
        password: 'StrongPassword123'
      };
      
      // Clear previous validation errors
      (mockRequest as any)._validationErrors = [];
      
      // Run all validators
      for (const validation of loginValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const validErrors = validationResult(mockRequest);
      expect(validErrors.isEmpty()).toBe(true);
    });
  });

  describe('Change Password Validation', () => {
    it('should validate password complexity', async () => {
      // Test simple password
      mockRequest.body = { 
        currentPassword: 'currentPass',
        newPassword: 'simple',
        confirmPassword: 'simple'
      };
      
      // Run all validators
      for (const validation of changePasswordValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const errors = validationResult(mockRequest);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(e => e.path === 'newPassword')).toBe(true);

      // Test complex but mismatched passwords
      mockRequest.body = {
        currentPassword: 'currentPass',
        newPassword: 'StrongP@ssw0rd',
        confirmPassword: 'DifferentP@ssw0rd'
      };
      
      // Clear previous validation errors
      (mockRequest as any)._validationErrors = [];
      
      // Run all validators
      for (const validation of changePasswordValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const mismatchErrors = validationResult(mockRequest);
      expect(mismatchErrors.isEmpty()).toBe(false);
      expect(mismatchErrors.array().some(e => e.path === 'confirmPassword')).toBe(true);

      // Test valid complex password with match
      mockRequest.body = {
        currentPassword: 'currentPass',
        newPassword: 'StrongP@ssw0rd',
        confirmPassword: 'StrongP@ssw0rd'
      };
      
      // Clear previous validation errors
      (mockRequest as any)._validationErrors = [];
      
      // Run all validators
      for (const validation of changePasswordValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const validErrors = validationResult(mockRequest);
      expect(validErrors.isEmpty()).toBe(true);
    });
  });

  describe('Refresh Token Validation', () => {
    it('should validate token presence', async () => {
      // Test missing token
      mockRequest.body = {};
      
      // Run all validators
      for (const validation of refreshTokenValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const errors = validationResult(mockRequest);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(e => e.path === 'refreshToken')).toBe(true);

      // Test valid token
      mockRequest.body = {
        refreshToken: 'valid-refresh-token'
      };
      
      // Clear previous validation errors
      (mockRequest as any)._validationErrors = [];
      
      // Run all validators
      for (const validation of refreshTokenValidation) {
        await validation(mockRequest as Request, mockResponse as Response, () => {});
      }
      
      // Check validation results
      const validErrors = validationResult(mockRequest);
      expect(validErrors.isEmpty()).toBe(true);
    });
  });
}); 