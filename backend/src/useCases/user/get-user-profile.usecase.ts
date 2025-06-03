import { UserRepository } from '@/repositories/user.repository';
import { AppError } from '@/types';
import { log } from '@/config/logger';
import { UserDTO } from '@/types/dto/user.dto';

/**
 * Caso de uso para obtenção do perfil do usuário
 */
export class GetUserProfileUseCase {
  constructor(
    private userRepository: UserRepository
  ) {}

  /**
   * Obtém o perfil do usuário pelo ID
   */
  public async execute(userId: string): Promise<UserDTO> {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Remove informações sensíveis
      const userProfile = { ...user };
      delete userProfile.password;
      delete userProfile.twoFactorSecret;
      
      log.info('User profile fetched successfully', { userId });
      return userProfile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error fetching user profile', { error: (error as Error).message, userId });
      throw new AppError('Erro ao buscar perfil do usuário', 500);
    }
  }
} 