import { UserRepository } from '@/repositories/user.repository';
import { UserDTO } from '@/types/dto/user.dto';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros de listagem de usuários
 */
export interface ListUsersParams {
  page: number;
  limit: number;
}

/**
 * Interface para o resultado da listagem de usuários
 */
export interface ListUsersResult {
  users: Omit<UserDTO, 'password'>[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Caso de uso para listar usuários
 */
export class ListUsersUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Executa a listagem de usuários com paginação
   */
  public async execute(params: ListUsersParams): Promise<ListUsersResult> {
    try {
      const { page, limit } = params;
      
      // Validar parâmetros
      if (page < 1) {
        throw new AppError('A página deve ser maior ou igual a 1', 400);
      }
      
      if (limit < 1 || limit > 100) {
        throw new AppError('O limite deve estar entre 1 e 100', 400);
      }

      // Buscar total de usuários para paginação
      const total = await this.userRepository.countUsers();
      
      // Buscar usuários com paginação
      const users = await this.userRepository.findAll({
        page,
        limit,
        orderBy: 'createdAt',
        order: 'desc',
      });
      
      // Remover senhas do resultado
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      // Calcular total de páginas
      const totalPages = Math.ceil(total / limit);

      log.info('Users listed successfully', { 
        page, 
        limit, 
        total, 
        totalPages,
        count: users.length 
      });

      return {
        users: usersWithoutPassword,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error: any) {
      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error listing users', { error: error.message });
      throw new AppError('Falha ao listar usuários', 500);
    }
  }
} 