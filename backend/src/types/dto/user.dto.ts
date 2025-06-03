import { UserRole } from '@/types';

/**
 * Interface para o Data Transfer Object (DTO) de usuário
 */
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  avatarUrl: string | null;
  lastLogin: Date | null;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
} 