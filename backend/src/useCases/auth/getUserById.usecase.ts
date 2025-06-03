import { UserRepository } from '@/repositories/user.repository';
import { UserDTO } from '@/types/dto/user.dto';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros de busca de usuário por ID
 */
export interface GetUserByIdParams {
  userId: string;
}

/**
 * Interface para o resultado da busca de usuário por ID
 */
export type GetUserByIdResult = Omit<UserDTO, 'password'> | null;

/**
 * Caso de uso para buscar usuário por ID
 */
export class GetUserByIdUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Executa a busca de usuário por ID
   */
  public async execute(params: GetUserByIdParams): Promise<GetUserByIdResult> {
    const { userId } = params;

    // Validar parâmetros
    if (!userId) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    try {
      // Buscar usuário por ID
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        log.info('User not found', { userId });
        return null;
      }

      // Remover senha do resultado
      const { password, ...userWithoutPassword } = user;

      log.info('User found successfully', { userId });

      return userWithoutPassword;
    } catch (error: any) {
      // Erro não esperado
      log.error('Error getting user by ID', { error: error.message, userId });
      throw new AppError('Falha ao buscar usuário', 500);
    }
  }
} 