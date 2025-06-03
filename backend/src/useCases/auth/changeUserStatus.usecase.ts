import { UserRepository } from '@/repositories/user.repository';
import { UserDTO } from '@/types/dto/user.dto';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros de alteração de status do usuário
 */
export interface ChangeUserStatusParams {
  userId: string;
  status: boolean; // true = ativo, false = inativo
}

/**
 * Interface para o resultado da alteração de status do usuário
 */
export type ChangeUserStatusResult = Omit<UserDTO, 'password'>;

/**
 * Caso de uso para alterar status do usuário
 */
export class ChangeUserStatusUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Executa a alteração de status do usuário
   */
  public async execute(params: ChangeUserStatusParams): Promise<ChangeUserStatusResult> {
    const { userId, status } = params;

    // Validar parâmetros
    if (!userId) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    if (status === undefined) {
      throw new AppError('Status é obrigatório', 400);
    }

    try {
      // Verificar se o usuário existe
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        log.warn('Attempt to change status of non-existent user', { userId, status });
        throw new AppError('Usuário não encontrado', 404);
      }

      // Atualizar status do usuário
      const updatedUser = await this.userRepository.update(userId, { isActive: status });

      // Remover senha do resultado
      const { password, ...userWithoutPassword } = updatedUser;

      log.info('User status changed successfully', { 
        userId, 
        oldStatus: user.isActive, 
        newStatus: status 
      });

      return userWithoutPassword;
    } catch (error: any) {
      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error changing user status', { error: error.message, userId, status });
      throw new AppError('Falha ao alterar status do usuário', 500);
    }
  }
} 