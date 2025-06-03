import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { LoginUseCase } from '../../../src/useCases/auth/login.usecase';
import { UserRepository } from '../../../src/repositories/user.repository';
import { TokenService } from '../../../src/domains/services/token.service';
import { PasswordService } from '../../../src/domains/services/password.service';
import { AuthenticationError } from '../../../src/utils/errors';
import { UserRole } from '../../../src/types';

// Mock dependencies
jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/domains/services/token.service');
jest.mock('../../../src/domains/services/password.service');

describe('LoginUseCase Security Tests', () => {
  let loginUseCase: LoginUseCase;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let tokenServiceMock: jest.Mocked<TokenService>;
  let passwordServiceMock: jest.Mocked<PasswordService>;

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    role: 'EMPLOYEE' as UserRole,
    isActive: true,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    avatarUrl: null
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mocked instances
    userRepositoryMock = {
      findByEmail: jest.fn(),
      saveRefreshToken: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    } as unknown as jest.Mocked<UserRepository>;

    tokenServiceMock = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn()
    } as unknown as jest.Mocked<TokenService>;

    passwordServiceMock = {
      compare: jest.fn(),
      hash: jest.fn()
    } as unknown as jest.Mocked<PasswordService>;

    // Create login usecase and replace its dependencies with mocks
    loginUseCase = new LoginUseCase();
    // Replace the dependencies with our mocks
    loginUseCase['userRepository'] = userRepositoryMock;
    loginUseCase['tokenService'] = tokenServiceMock;
    loginUseCase['passwordService'] = passwordServiceMock;
  });

  it('should reject login with invalid credentials', async () => {
    // Arrange
    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    passwordServiceMock.compare.mockResolvedValue(false);

    // Act & Assert
    await expect(loginUseCase.execute({
      email: 'test@example.com',
      password: 'wrong_password'
    })).rejects.toThrow(AuthenticationError);

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(passwordServiceMock.compare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
  });

  it('should reject login for inactive users', async () => {
    // Arrange
    const inactiveUser = { ...mockUser, isActive: false };
    userRepositoryMock.findByEmail.mockResolvedValue(inactiveUser);
    passwordServiceMock.compare.mockResolvedValue(true);

    // Act & Assert
    await expect(loginUseCase.execute({
      email: 'test@example.com',
      password: 'correct_password'
    })).rejects.toThrow(AuthenticationError);
  });

  it('should handle non-existent user securely', async () => {
    // Arrange
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(loginUseCase.execute({
      email: 'nonexistent@example.com',
      password: 'any_password'
    })).rejects.toThrow(AuthenticationError);

    // Verify it doesn't leak information about user existence
    expect(passwordServiceMock.compare).not.toHaveBeenCalled();
  });

  it('should return auth tokens on successful login without 2FA', async () => {
    // Arrange
    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    passwordServiceMock.compare.mockResolvedValue(true);
    tokenServiceMock.generateAccessToken.mockReturnValue('access_token');
    tokenServiceMock.generateRefreshToken.mockReturnValue('refresh_token');

    // Act
    const result = await loginUseCase.execute({
      email: 'test@example.com',
      password: 'correct_password'
    });

    // Assert - adjust this based on the actual return structure of your usecase
    expect(result).toHaveProperty('accessToken', 'access_token');
    expect(result).toHaveProperty('refreshToken', 'refresh_token');
    expect(result).toHaveProperty('requiresTwoFactor', false);
    expect(result.user).toMatchObject({
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'EMPLOYEE'
    });
    
    // Verify refresh token was saved
    expect(userRepositoryMock.saveRefreshToken).toHaveBeenCalledWith('user123', 'refresh_token');
  });

  it('should indicate 2FA requirement when user has 2FA enabled', async () => {
    // Arrange
    const twoFactorUser = {
      ...mockUser,
      twoFactorEnabled: true,
      twoFactorSecret: 'secret'
    };
    userRepositoryMock.findByEmail.mockResolvedValue(twoFactorUser);
    passwordServiceMock.compare.mockResolvedValue(true);

    // Act
    const result = await loginUseCase.execute({
      email: 'test@example.com',
      password: 'correct_password'
    });

    // Assert - adjust based on your actual implementation
    expect(result).toHaveProperty('requiresTwoFactor', true);
    
    // Tokens should still be generated for 2FA verification
    expect(tokenServiceMock.generateAccessToken).toHaveBeenCalled();
    expect(tokenServiceMock.generateRefreshToken).toHaveBeenCalled();
  });

  it('should reject login with empty credentials', async () => {
    // Act & Assert
    await expect(loginUseCase.execute({
      email: '',
      password: 'password'
    })).rejects.toThrow(AuthenticationError);

    await expect(loginUseCase.execute({
      email: 'email@example.com',
      password: ''
    })).rejects.toThrow(AuthenticationError);
  });
}); 