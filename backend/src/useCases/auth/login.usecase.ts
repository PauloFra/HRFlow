import { UserRepository } from '@/repositories/user.repository';
import { TokenService } from '@/domains/services/token.service';
import { PasswordService } from '@/domains/services/password.service';
import { UserDTO } from '@/types/dto/user.dto';
import { log } from '@/config/logger';
import { AuthenticationError } from '@/utils/errors';

/**
 * Interface para os parâmetros do login
 */
export interface LoginParams {
  email: string;
  password: string;
}

/**
 * Interface para o resultado do login
 */
export interface LoginResult {
  user: Omit<UserDTO, 'password'>;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
}

/**
 * Caso de uso para login
 */
export class LoginUseCase {
  private userRepository: UserRepository;
  private tokenService: TokenService;
  private passwordService: PasswordService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
    this.passwordService = new PasswordService();
  }

  /**
   * Executa o login
   */
  public async execute(params: LoginParams): Promise<LoginResult> {
    const { email, password } = params;

    // Validar parâmetros
    if (!email || !password) {
      throw new AuthenticationError('Email e senha são obrigatórios');
    }

    // Buscar usuário por email
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      // Log genérico para não revelar se o email existe ou não
      log.info('Login attempt with non-existent email', { email });
      throw new AuthenticationError('Credenciais inválidas');
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      log.info('Login attempt with inactive account', { userId: user.id });
      throw new AuthenticationError('Conta inativa. Entre em contato com o administrador');
    }

    // Verificar senha
    const isPasswordValid = await this.passwordService.compare(password, user.password);
    
    if (!isPasswordValid) {
      log.info('Login attempt with invalid password', { userId: user.id });
      throw new AuthenticationError('Credenciais inválidas');
    }

    // Verificar se 2FA está habilitado
    const requiresTwoFactor = user.twoFactorEnabled || false;

    // Gerar tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    // Armazenar refresh token
    await this.userRepository.saveRefreshToken(user.id, refreshToken);

    // Remover senha e dados sensíveis do retorno
    const { password: _removed, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      requiresTwoFactor,
    };
  }
} 