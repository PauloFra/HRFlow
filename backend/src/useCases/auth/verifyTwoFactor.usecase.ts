import { UserRepository } from '@/repositories/user.repository';
import { TokenService } from '@/domains/services/token.service';
import { log } from '@/config/logger';
import { AppError } from '@/types';
import * as speakeasy from 'speakeasy';

/**
 * Interface para os parâmetros de verificação do 2FA
 */
export interface VerifyTwoFactorParams {
  userId: string;
  token: string;
}

/**
 * Interface para o resultado da verificação do 2FA
 */
export interface VerifyTwoFactorResult {
  verified: boolean;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Caso de uso para verificação de autenticação de dois fatores
 */
export class VerifyTwoFactorUseCase {
  private userRepository: UserRepository;
  private tokenService: TokenService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
  }

  /**
   * Executa a verificação do 2FA
   */
  public async execute(params: VerifyTwoFactorParams): Promise<VerifyTwoFactorResult> {
    const { userId, token } = params;

    // Validar parâmetros
    if (!userId) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    if (!token) {
      throw new AppError('Token é obrigatório', 400);
    }

    try {
      // Buscar usuário
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        log.warn('Attempt to verify 2FA for non-existent user', { userId });
        throw new AppError('Usuário não encontrado', 404);
      }

      // Verificar se o usuário tem um secret para 2FA
      if (!user.twoFactorSecret) {
        log.warn('Attempt to verify 2FA without setup', { userId });
        throw new AppError('Autenticação de dois fatores não configurada', 400);
      }

      // Verificar o token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1, // Permite uma janela de 30 segundos antes/depois
      });

      if (!verified) {
        log.warn('Invalid 2FA token', { userId });
        return { verified: false };
      }

      // Se a verificação for bem-sucedida e 2FA ainda não estiver ativado,
      // ativamos o 2FA para o usuário
      if (!user.twoFactorEnabled) {
        await this.userRepository.enableTwoFactor(userId);
        log.info('2FA enabled for user', { userId });
      }

      // Gerar tokens para o usuário verificado
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = this.tokenService.generateRefreshToken(user.id);

      // Salvar o refresh token
      await this.userRepository.saveRefreshToken(userId, refreshToken);

      log.info('2FA verification successful', { userId });

      return {
        verified: true,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error during 2FA verification', { error: error.message, userId });
      throw new AppError('Falha ao verificar autenticação de dois fatores', 500);
    }
  }
} 