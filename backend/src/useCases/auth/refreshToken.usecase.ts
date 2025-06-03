import { UserRepository } from '@/repositories/user.repository';
import { TokenService } from '@/domains/services/token.service';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros do refresh token
 */
export interface RefreshTokenParams {
  refreshToken: string;
}

/**
 * Interface para o resultado do refresh token
 */
export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * Caso de uso para refresh token
 */
export class RefreshTokenUseCase {
  private userRepository: UserRepository;
  private tokenService: TokenService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
  }

  /**
   * Executa o refresh token
   */
  public async execute(params: RefreshTokenParams): Promise<RefreshTokenResult> {
    const { refreshToken } = params;

    // Validar parâmetros
    if (!refreshToken) {
      throw new AppError('Refresh token é obrigatório', 400);
    }

    try {
      // Verificar se o refresh token é válido
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      
      // Verificar se o token existe no banco de dados
      const user = await this.userRepository.findByRefreshToken(refreshToken);
      
      if (!user) {
        log.warn('Refresh token not found in database', { 
          userId: payload.userId,
          tokenPreview: refreshToken.substring(0, 10) + '...' 
        });
        throw new AppError('Token inválido ou expirado', 401);
      }

      // Verificar se o usuário está ativo
      if (!user.isActive) {
        log.warn('Refresh token for inactive user', { userId: user.id });
        throw new AppError('Conta inativa', 403);
      }

      // Gerar novo access token
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Gerar novo refresh token
      const newRefreshToken = this.tokenService.generateRefreshToken(user.id);

      // Invalidar o refresh token antigo e salvar o novo
      await this.userRepository.rotateRefreshToken(refreshToken, newRefreshToken);

      log.info('Token refreshed successfully', { userId: user.id });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      // Se for um erro de JWT, tratamos como token inválido
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        log.warn('Invalid refresh token', { error: error.message });
        throw new AppError('Token inválido ou expirado', 401);
      }

      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error during token refresh', { error: error.message });
      throw new AppError('Falha ao atualizar token', 500);
    }
  }
} 