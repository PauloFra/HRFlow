import { User } from '@prisma/client';
import { UserDTO } from '@/types/dto/user.dto';
import { BaseRepository, IBaseRepository } from './base.repository';
import { UserRole, UserStatus } from '@/types';
import { log } from '@/config/logger';
import PrismaService from '@/services/prisma.service';

/**
 * Repositório para operações com usuários
 */
export class UserRepository extends BaseRepository implements IBaseRepository<UserDTO, string> {
  private prisma: any;

  constructor() {
    super();
    this.prisma = PrismaService.getInstance().prisma;
  }

  /**
   * Busca usuário por ID
   */
  public async findById(id: string): Promise<UserDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          employee: true,
          refreshTokens: true,
        },
      });

      if (!user) return null;

      return this.mapToUserDTO(user);
    } catch (error) {
      log.error('Error finding user by ID', { error: (error as Error).message, userId: id });
      throw error;
    }
  }

  /**
   * Busca usuário por email
   */
  public async findByEmail(email: string): Promise<UserDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          employee: true,
          refreshTokens: true,
        },
      });

      if (!user) return null;

      return this.mapToUserDTO(user);
    } catch (error) {
      log.error('Error finding user by email', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Cria um novo usuário
   */
  public async create(userData: Omit<UserDTO, 'id'>): Promise<UserDTO> {
    try {
      const { 
        name, 
        email, 
        password, 
        role, 
        isActive = true,
        twoFactorEnabled = false,
        twoFactorSecret = null,
        avatarUrl = null,
      } = userData;

      const user = await this.prisma.user.create({
        data: {
          username: name,
          email,
          passwordHash: password,
          role: role as UserRole,
          status: isActive ? 'ACTIVE' as UserStatus : 'INACTIVE' as UserStatus,
          twoFactorEnabled,
          twoFactorSecret,
          // Outros campos são gerenciados automaticamente
        },
        include: {
          employee: true,
        },
      });

      return this.mapToUserDTO(user);
    } catch (error) {
      log.error('Error creating user', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Atualiza dados do usuário
   */
  public async update(id: string, userData: Partial<UserDTO>): Promise<UserDTO> {
    try {
      // Mapeamento para os campos do schema
      const prismaData: any = {};
      
      if (userData.name !== undefined) prismaData.username = userData.name;
      if (userData.email !== undefined) prismaData.email = userData.email;
      if (userData.password !== undefined) prismaData.passwordHash = userData.password;
      if (userData.role !== undefined) prismaData.role = userData.role;
      if (userData.isActive !== undefined) prismaData.status = userData.isActive ? 'ACTIVE' as UserStatus : 'INACTIVE' as UserStatus;
      if (userData.twoFactorEnabled !== undefined) prismaData.twoFactorEnabled = userData.twoFactorEnabled;
      if (userData.twoFactorSecret !== undefined) prismaData.twoFactorSecret = userData.twoFactorSecret;
      if (userData.lastLogin !== undefined) prismaData.lastLoginAt = userData.lastLogin;
      
      const user = await this.prisma.user.update({
        where: { id },
        data: prismaData,
        include: {
          employee: true,
          refreshTokens: true,
        },
      });

      return this.mapToUserDTO(user);
    } catch (error) {
      log.error('Error updating user', { error: (error as Error).message, userId: id });
      throw error;
    }
  }

  /**
   * Salva um refresh token para o usuário
   */
  public async saveRefreshToken(userId: string, token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.create({
        data: {
          token,
          userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        },
      });
    } catch (error) {
      log.error('Error saving refresh token', { error: (error as Error).message, userId });
      throw error;
    }
  }

  /**
   * Busca um usuário pelo refresh token
   */
  public async findByRefreshToken(token: string): Promise<UserDTO | null> {
    try {
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              employee: true,
              refreshTokens: true,
            },
          },
        },
      });

      if (!refreshToken || !refreshToken.user) return null;

      return this.mapToUserDTO(refreshToken.user);
    } catch (error) {
      log.error('Error finding user by refresh token', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Invalida um refresh token
   */
  public async invalidateRefreshToken(token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.delete({
        where: { token },
      });
    } catch (error) {
      log.error('Error invalidating refresh token', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Troca um refresh token antigo por um novo
   */
  public async rotateRefreshToken(oldToken: string, newToken: string): Promise<void> {
    try {
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { token: oldToken },
      });

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      // Transação para garantir a atomicidade
      await this.prisma.$transaction([
        this.prisma.refreshToken.delete({
          where: { token: oldToken },
        }),
        this.prisma.refreshToken.create({
          data: {
            token: newToken,
            userId: refreshToken.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          },
        }),
      ]);
    } catch (error) {
      log.error('Error rotating refresh token', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Salva o segredo para 2FA do usuário
   */
  public async saveTwoFactorSecret(userId: string, secret: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: secret,
        },
      });
    } catch (error) {
      log.error('Error saving 2FA secret', { error: (error as Error).message, userId });
      throw error;
    }
  }

  /**
   * Ativa a autenticação de dois fatores para o usuário
   */
  public async enableTwoFactor(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
        },
      });
    } catch (error) {
      log.error('Error enabling 2FA', { error: (error as Error).message, userId });
      throw error;
    }
  }

  /**
   * Salva o token de redefinição de senha
   */
  public async savePasswordResetToken(userId: string, token: string): Promise<void> {
    try {
      // Primeiro removemos qualquer token antigo
      await this.prisma.passwordReset.deleteMany({
        where: { userId },
      });

      // Criamos o novo token
      await this.prisma.passwordReset.create({
        data: {
          token,
          userId,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
        },
      });
    } catch (error) {
      log.error('Error saving password reset token', { error: (error as Error).message, userId });
      throw error;
    }
  }

  /**
   * Busca usuário pelo token de redefinição de senha
   */
  public async findByPasswordResetToken(token: string): Promise<UserDTO | null> {
    try {
      const passwordReset = await this.prisma.passwordReset.findFirst({
        where: {
          token,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            include: {
              employee: true,
            },
          },
        },
      });

      if (!passwordReset || !passwordReset.user) return null;

      return this.mapToUserDTO(passwordReset.user);
    } catch (error) {
      log.error('Error finding user by password reset token', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Atualiza a senha do usuário
   */
  public async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPassword,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      log.error('Error updating password', { error: (error as Error).message, userId });
      throw error;
    }
  }

  /**
   * Remove o token de redefinição de senha
   */
  public async removePasswordResetToken(userId: string): Promise<void> {
    try {
      await this.prisma.passwordReset.deleteMany({
        where: { userId },
      });
    } catch (error) {
      log.error('Error removing password reset token', { error: (error as Error).message, userId });
      throw error;
    }
  }

  /**
   * Conta o total de usuários
   */
  public async countUsers(filters?: any): Promise<number> {
    try {
      const count = await this.prisma.user.count({
        where: filters,
      });
      return count;
    } catch (error) {
      log.error('Error counting users', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Busca todos os usuários com paginação
   */
  public async findAll(options: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
    filters?: any;
  }): Promise<UserDTO[]> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        orderBy = 'createdAt', 
        order = 'desc',
        filters = {} 
      } = options;

      const skip = (page - 1) * limit;

      const users = await this.prisma.user.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: {
          [orderBy]: order,
        },
        include: {
          employee: true,
        },
      });

      return users.map((user: User) => this.mapToUserDTO(user));
    } catch (error) {
      log.error('Error finding all users', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Mapeia o modelo do Prisma para o DTO
   */
  private mapToUserDTO(user: User & { employee?: any; refreshTokens?: any[] }): UserDTO {
    return {
      id: user.id,
      name: user.username || '',
      email: user.email,
      password: user.passwordHash,
      role: user.role as UserRole,
      isActive: user.status === 'ACTIVE',
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret || null,
      avatarUrl: null,
      lastLogin: user.lastLoginAt || null,
      employeeId: user.employee?.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Exclui um usuário pelo ID
   */
  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      log.error('Error deleting user', { error: (error as Error).message, userId: id });
      return false;
    }
  }
  
  /**
   * Conta o total de usuários com base em um filtro
   */
  public async count(filter?: any): Promise<number> {
    return this.countUsers(filter);
  }
} 