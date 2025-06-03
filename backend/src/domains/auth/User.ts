import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface UserProps {
  id?: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly twoFactorEnabled: boolean;
  readonly twoFactorSecret?: string;
  readonly lastLogin?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id || uuidv4();
    this.email = props.email;
    this.name = props.name;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.isActive = props.isActive;
    this.twoFactorEnabled = props.twoFactorEnabled || false;
    this.twoFactorSecret = props.twoFactorSecret;
    this.lastLogin = props.lastLogin;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  public isHR(): boolean {
    return this.role === 'HR' || this.isAdmin();
  }

  public isManager(): boolean {
    return this.role === 'MANAGER' || this.isHR();
  }

  public canManageUsers(): boolean {
    return this.isHR();
  }

  public toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      twoFactorEnabled: this.twoFactorEnabled,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
} 