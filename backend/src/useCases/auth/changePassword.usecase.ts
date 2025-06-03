import { UserRepository } from '@/repositories/user.repository';
import { PasswordService } from '@/domains/services/password.service';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros de alteração de senha
 */
export interface ChangePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * Caso de uso para alteração de senha (usuário autenticado)
 */
export class ChangePasswordUseCase {
  private userRepository: UserRepository;
  private passwordService: PasswordService;

  constructor() {
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
  }

  /**
   * Executa a alteração de senha
   */
  public async execute(params: ChangePasswordParams): Promise<void> {
    const { userId, currentPassword, newPassword } = params;

    // Validar parâmetros
    if (!userId) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    if (!currentPassword) {
      throw new AppError('Senha atual é obrigatória', 400);
    }

    if (!newPassword) {
      throw new AppError('Nova senha é obrigatória', 400);
    }

    // Validar força da nova senha
    if (newPassword.length < 8) {
      throw new AppError('A nova senha deve ter pelo menos 8 caracteres', 400);
    }

    try {
      // Buscar usuário
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        log.warn('Change password attempted for non-existent user', { userId });
        throw new AppError('Usuário não encontrado', 404);
      }

      // Verificar se o usuário está ativo
      if (!user.isActive) {
        log.warn('Change password attempted for inactive user', { userId });
        throw new AppError('Conta inativa', 403);
      }

      // Verificar senha atual
      const isPasswordValid = await this.passwordService.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        log.warn('Change password attempted with invalid current password', { userId });
        throw new AppError('Senha atual incorreta', 401);
      }

      // Verificar se a nova senha é diferente da atual
      if (currentPassword === newPassword) {
        throw new AppError('A nova senha deve ser diferente da senha atual', 400);
      }

      // Gerar hash da nova senha
      const hashedPassword = await this.passwordService.hash(newPassword);
      
      // Atualizar senha
      await this.userRepository.updatePassword(userId, hashedPassword);

      log.info('Password changed successfully', { userId });
    } catch (error: any) {
      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error during password change', { error: error.message, userId });
      throw new AppError('Falha ao alterar senha', 500);
    }
  }
} 