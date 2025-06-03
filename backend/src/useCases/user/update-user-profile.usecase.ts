import { UserRepository } from '@/repositories/user.repository';
import { AppError } from '@/types';
import { log } from '@/config/logger';
import { UserDTO } from '@/types/dto/user.dto';

/**
 * Caso de uso para atualização do perfil do usuário
 */
export class UpdateUserProfileUseCase {
  constructor(
    private userRepository: UserRepository
  ) {}

  /**
   * Atualiza o perfil do usuário
   */
  public async execute(userId: string, data: Partial<UserDTO>): Promise<UserDTO> {
    try {
      // Verifica se o usuário existe
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Não permitir atualização de campos sensíveis
      const safeData: Partial<UserDTO> = { ...data };
      
      // Remover campos que não devem ser atualizados diretamente pelo perfil
      delete safeData.id;
      delete safeData.role;
      delete safeData.password;
      delete safeData.isActive;
      delete safeData.twoFactorEnabled;
      delete safeData.twoFactorSecret;
      delete safeData.createdAt;
      delete safeData.lastLogin;
      
      // Atualizar apenas campos permitidos: nome e email
      const updatedUser = await this.userRepository.update(userId, safeData);
      if (!updatedUser) {
        throw new AppError('Erro ao atualizar perfil do usuário', 500);
      }

      // Remover informações sensíveis do resultado
      const userProfile = { ...updatedUser };
      delete userProfile.password;
      delete userProfile.twoFactorSecret;
      
      log.info('User profile updated successfully', { userId });
      return userProfile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error updating user profile', { error: (error as Error).message, userId });
      throw new AppError('Erro ao atualizar perfil do usuário', 500);
    }
  }
} 