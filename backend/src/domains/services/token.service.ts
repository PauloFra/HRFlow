import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '@/config/env';
import { log } from '@/config/logger';
import { UserRole } from '@/types';
import { config } from '@/config';

/**
 * Interface para payload do access token
 */
export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  employeeId?: string;
}

/**
 * Interface para payload do refresh token
 */
export interface RefreshTokenPayload {
  userId: string;
  version: string;
}

/**
 * Interface para payload do token de redefinição de senha
 */
export interface PasswordResetTokenPayload {
  userId: string;
}

/**
 * Serviço para gerenciamento de tokens JWT
 */
export class TokenService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private passwordResetSecret: string;
  private accessTokenExpiration: string;
  private refreshTokenExpiration: string;
  private passwordResetExpiration: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || config.jwt.secret;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || config.jwt.refreshSecret;
    this.passwordResetSecret = process.env.JWT_PASSWORD_RESET_SECRET || config.jwt.passwordResetSecret;
    
    this.accessTokenExpiration = process.env.JWT_EXPIRATION || '1h';
    this.refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';
    this.passwordResetExpiration = process.env.JWT_PASSWORD_RESET_EXPIRATION || '1h';
  }

  /**
   * Gera um access token JWT
   */
  public generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiration,
    });
  }

  /**
   * Gera um refresh token JWT
   */
  public generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
      userId,
      version: Date.now().toString(), // Identificador único para cada token
    };

    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiration,
    });
  }

  /**
   * Gera um token para redefinição de senha
   */
  public generatePasswordResetToken(userId: string): string {
    const payload: PasswordResetTokenPayload = { userId };

    return jwt.sign(payload, this.passwordResetSecret, {
      expiresIn: this.passwordResetExpiration,
    });
  }

  /**
   * Verifica e decodifica um access token
   */
  public verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, this.accessTokenSecret) as AccessTokenPayload;
  }

  /**
   * Verifica e decodifica um refresh token
   */
  public verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;
  }

  /**
   * Verifica e decodifica um token de redefinição de senha
   */
  public verifyPasswordResetToken(token: string): PasswordResetTokenPayload {
    return jwt.verify(token, this.passwordResetSecret) as PasswordResetTokenPayload;
  }
} 