import { UserRepository } from '@/repositories/user.repository';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros do logout
 */
export interface LogoutParams {
  refreshToken: string;
}

/**
 * Caso de uso para logout
 */
export class LogoutUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Executa o logout
   */
  public async execute(params: LogoutParams): Promise<void> {
    const { refreshToken } = params;

    // Validar parâmetros
    if (!refreshToken) {
      throw new AppError('Refresh token é obrigatório', 400);
    }

    try {
      // Invalidar o refresh token
      await this.userRepository.invalidateRefreshToken(refreshToken);
      
      log.info('Logout successful', { refreshToken: refreshToken.substring(0, 10) + '...' });
    } catch (error: any) {
      log.error('Error during logout', { error: error.message });
      throw new AppError('Falha ao realizar logout', 500);
    }
  }
} 