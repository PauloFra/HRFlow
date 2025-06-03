import { UserRepository } from '@/repositories/user.repository';
import { UserDTO } from '@/types/dto/user.dto';
import { UserRole } from '@/types';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros de alteração de papel do usuário
 */
export interface ChangeUserRoleParams {
  userId: string;
  role: UserRole;
}

/**
 * Interface para o resultado da alteração de papel do usuário
 */
export type ChangeUserRoleResult = Omit<UserDTO, 'password'>;

/**
 * Caso de uso para alterar papel (role) do usuário
 */
export class ChangeUserRoleUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Executa a alteração de papel do usuário
   */
  public async execute(params: ChangeUserRoleParams): Promise<ChangeUserRoleResult> {
    const { userId, role } = params;

    // Validar parâmetros
    if (!userId) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    if (!role) {
      throw new AppError('Papel (role) é obrigatório', 400);
    }

    // Validar se o papel é válido
    const validRoles: UserRole[] = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Papel inválido. Deve ser um dos seguintes: ${validRoles.join(', ')}`, 400);
    }

    try {
      // Verificar se o usuário existe
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        log.warn('Attempt to change role of non-existent user', { userId, role });
        throw new AppError('Usuário não encontrado', 404);
      }

      // Atualizar papel do usuário
      const updatedUser = await this.userRepository.update(userId, { role });

      // Remover senha do resultado
      const { password, ...userWithoutPassword } = updatedUser;

      log.info('User role changed successfully', { 
        userId, 
        oldRole: user.role, 
        newRole: role 
      });

      return userWithoutPassword;
    } catch (error: any) {
      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error changing user role', { error: error.message, userId, role });
      throw new AppError('Falha ao alterar papel do usuário', 500);
    }
  }
} 