import { UserRepository } from '@/repositories/user.repository';
import { log } from '@/config/logger';
import { AppError } from '@/types';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

/**
 * Interface para os parâmetros de configuração do 2FA
 */
export interface SetupTwoFactorParams {
  userId: string;
}

/**
 * Interface para o resultado da configuração do 2FA
 */
export interface SetupTwoFactorResult {
  secret: string;
  otpAuthUrl: string;
  qrCodeUrl: string;
}

/**
 * Caso de uso para configuração de autenticação de dois fatores
 */
export class SetupTwoFactorUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Executa a configuração do 2FA
   */
  public async execute(params: SetupTwoFactorParams): Promise<SetupTwoFactorResult> {
    const { userId } = params;

    // Validar parâmetros
    if (!userId) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    try {
      // Buscar usuário
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        log.warn('Attempt to setup 2FA for non-existent user', { userId });
        throw new AppError('Usuário não encontrado', 404);
      }

      // Gerar segredo para 2FA
      const secret = speakeasy.generateSecret({
        length: 20,
        name: `HRFlow:${user.email}`,
        issuer: 'HRFlow',
      });

      // Gerar URL para QR Code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

      // Salvar o secret temporariamente no usuário
      // Não ativamos o 2FA ainda, só após a verificação
      await this.userRepository.saveTwoFactorSecret(userId, secret.base32);

      log.info('2FA setup initiated', { userId });

      return {
        secret: secret.base32,
        otpAuthUrl: secret.otpauth_url || '',
        qrCodeUrl,
      };
    } catch (error: any) {
      // Se for um erro já tratado, apenas repassamos
      if (error instanceof AppError) {
        throw error;
      }

      // Erro não esperado
      log.error('Error during 2FA setup', { error: error.message, userId });
      throw new AppError('Falha ao configurar autenticação de dois fatores', 500);
    }
  }
} 