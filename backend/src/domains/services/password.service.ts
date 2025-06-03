import bcrypt from 'bcrypt';
import { log } from '@/config/logger';

/**
 * Serviço para operações com senhas
 */
export class PasswordService {
  private readonly SALT_ROUNDS = 10;

  /**
   * Criar hash de senha
   */
  public async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      log.error('Error hashing password', { error: error.message });
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Comparar senha com hash
   */
  public async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      log.error('Error comparing password', { error: error.message });
      throw new Error('Failed to compare password');
    }
  }

  /**
   * Verificar se a senha atende aos requisitos mínimos
   */
  public validatePasswordStrength(password: string): boolean {
    // Pelo menos 8 caracteres
    if (password.length < 8) {
      return false;
    }

    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      return false;
    }

    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      return false;
    }

    // Pelo menos um número
    if (!/[0-9]/.test(password)) {
      return false;
    }

    // Pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return false;
    }

    return true;
  }

  /**
   * Gerar senha aleatória segura
   */
  public generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    // Garantir que a senha atenda aos requisitos mínimos
    if (!this.validatePasswordStrength(password)) {
      return this.generateRandomPassword();
    }

    return password;
  }
} 