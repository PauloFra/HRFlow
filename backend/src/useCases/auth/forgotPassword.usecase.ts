import { UserRepository } from '@/repositories/user.repository';
import { TokenService } from '@/domains/services/token.service';
import { EmailService } from '@/domains/services/email.service';
import { log } from '@/config/logger';
import { AppError } from '@/types';

/**
 * Interface para os parâmetros de recuperação de senha
 */
export interface ForgotPasswordParams {
  email: string;
}

/**
 * Caso de uso para recuperação de senha
 */
export class ForgotPasswordUseCase {
  private userRepository: UserRepository;
  private tokenService: TokenService;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
    this.emailService = new EmailService();
  }

  /**
   * Executa o processo de recuperação de senha
   */
  public async execute(params: ForgotPasswordParams): Promise<void> {
    const { email } = params;

    // Validar parâmetros
    if (!email) {
      throw new AppError('Email é obrigatório', 400);
    }

    try {
      // Buscar usuário por email
      const user = await this.userRepository.findByEmail(email);
      
      // Se o usuário não existir, não informamos para evitar enumeração de emails
      if (!user || !user.isActive) {
        log.info('Password reset requested for non-existent or inactive account', { email });
        return; // Retornamos sem erro para não revelar a existência do usuário
      }

      // Gerar token de redefinição de senha
      const resetToken = this.tokenService.generatePasswordResetToken(user.id);
      
      // Salvar token no banco de dados
      await this.userRepository.savePasswordResetToken(user.id, resetToken);

      // Enviar email com link para redefinição de senha
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      await this.emailService.sendPasswordReset({
        to: user.email,
        name: user.name,
        resetLink,
      });

      log.info('Password reset email sent', { userId: user.id, email });
    } catch (error: any) {
      // Erro não esperado
      log.error('Error during password reset request', { error: error.message, email });
      throw new AppError('Falha ao processar solicitação de redefinição de senha', 500);
    }
  }
} 