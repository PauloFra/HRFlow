import * as nodemailer from 'nodemailer';
import { log } from '@/config/logger';

/**
 * Interface para email de redefinição de senha
 */
interface PasswordResetEmailData {
  to: string;
  name: string;
  resetLink: string;
}

/**
 * Serviço para envio de emails
 */
export class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor() {
    // Criar transportador de email
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: false,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });

    this.from = process.env.SMTP_FROM || '"HRFlow" <no-reply@hrflow.app>';
  }

  /**
   * Envia email de redefinição de senha
   */
  public async sendPasswordReset(data: PasswordResetEmailData): Promise<void> {
    const { to, name, resetLink } = data;

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Redefinição de Senha - HRFlow',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Olá, ${name}!</h2>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
            <p>Este link expirará em 1 hora por motivos de segurança.</p>
            <hr>
            <p style="color: #888; font-size: 12px;">
              Este é um email automático, por favor não responda.
            </p>
          </div>
        `,
        text: `
          Olá, ${name}!
          
          Recebemos uma solicitação para redefinir sua senha.
          
          Para criar uma nova senha, acesse o link abaixo:
          ${resetLink}
          
          Se você não solicitou a redefinição de senha, ignore este email.
          
          Este link expirará em 1 hora por motivos de segurança.
        `,
      });

      log.info('Password reset email sent', { messageId: info.messageId, to });
    } catch (error: any) {
      log.error('Failed to send password reset email', { error: error.message, to });
      throw new Error(`Falha ao enviar email de redefinição de senha: ${error.message}`);
    }
  }
} 