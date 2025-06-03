import { UserRepository } from '@/repositories/user.repository';
import { TokenService } from '@/domains/services/token.service';
import { PasswordService } from '@/domains/services/password.service';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros de redefinição de senha
 */
export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

/**
 * Caso de uso para redefinição de senha
 */
export class ResetPasswordUseCase {
  private userRepository: UserRepository;
  private tokenService: TokenService;
  private passwordService: PasswordService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
    this.passwordService = new PasswordService();
  }

  /**
   * Executa a redefinição de senha
   */
  public async execute(params: ResetPasswordParams): Promise<void> {
    const { token, newPassword } = params;

    // Validar parâmetros
    if (!token) {
      throw new AppError('Token é obrigatório', 400);
    }

    if (!newPassword) {
      throw new AppError('Nova senha é obrigatória', 400);
    }

    // Validar força da senha
    if (newPassword.length < 8) {
      throw new AppError('A senha deve ter pelo menos 8 caracteres', 400);
    }

    try {
      // Verificar se o token é válido
      const payload = this.tokenService.verifyPasswordResetToken(token);
      
      // Buscar usuário pelo token de redefinição
      const user = await this.userRepository.findByPasswordResetToken(token);
      
      if (!user) {
        log.warn('Password reset attempted with invalid token', { 
          tokenPreview: token.substring(0, 10) + '...',
          userId: payload?.userId 
        });
        throw new AppError('Token inválido ou expirado', 400);
      }

      // Verificar se o usuário está ativo
      if (!user.isActive) {
        log.warn('Password reset attempted for inactive user', { userId: user.id });
        throw new AppError('Conta inativa', 403);
      }

      // Gerar hash da nova senha
      const hashedPassword = await this.passwordService.hash(newPassword);
      
      // Atualizar senha e remover token de redefinição
      await this.userRepository.updatePassword(user.id, hashedPassword);
      await this.userRepository.removePasswordResetToken(user.id);

      log.info('Password reset successful', { userId: user.id });
    } catch (error: any) {
      // Se for um erro de JWT, tratamos como token inválido
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        log.warn('Invalid or expired reset token', { error: error.message });
        throw new AppError('Token inválido ou expirado', 400);
      }

      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error during password reset', { error: error.message });
      throw new AppError('Falha ao redefinir senha', 500);
    }
  }
} 