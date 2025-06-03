import { UserRepository } from '@/repositories/user.repository';
import { PasswordService } from '@/domains/services/password.service';
import { TokenService } from '@/domains/services/token.service';
import { UserDTO } from '@/types/dto/user.dto';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros de registro
 */
export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

/**
 * Interface para o resultado do registro
 */
export interface RegisterResult {
  user: Omit<UserDTO, 'password'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * Caso de uso para registro de novos usuários
 */
export class RegisterUseCase {
  private userRepository: UserRepository;
  private passwordService: PasswordService;
  private tokenService: TokenService;

  constructor() {
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
    this.tokenService = new TokenService();
  }

  /**
   * Executa o registro de um novo usuário
   */
  public async execute(params: RegisterParams): Promise<RegisterResult> {
    const { name, email, password } = params;

    // Validar parâmetros
    if (!name || !email || !password) {
      throw new AppError('Nome, email e senha são obrigatórios', 400);
    }

    try {
      // Verificar se o email já está em uso
      const existingUser = await this.userRepository.findByEmail(email);
      
      if (existingUser) {
        log.warn('Registration attempt with existing email', { email });
        throw new AppError('Este email já está em uso', 409);
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Formato de email inválido', 400);
      }

      // Validar força da senha
      if (password.length < 8) {
        throw new AppError('A senha deve ter pelo menos 8 caracteres', 400);
      }

      // Hash da senha
      const hashedPassword = await this.passwordService.hash(password);

      // Criar usuário
      const newUser = await this.userRepository.create({
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE', // Papel padrão
        isActive: true,
        twoFactorEnabled: false,
      });

      // Gerar tokens
      const accessToken = this.tokenService.generateAccessToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      const refreshToken = this.tokenService.generateRefreshToken(newUser.id);

      // Salvar refresh token
      await this.userRepository.saveRefreshToken(newUser.id, refreshToken);

      log.info('User registered successfully', { userId: newUser.id, email });

      // Remover senha do objeto de retorno
      const { password: _removed, ...userWithoutPassword } = newUser;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error during user registration', { error: error.message, email });
      throw new AppError('Falha ao registrar usuário', 500);
    }
  }
} 