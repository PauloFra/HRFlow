import { Request, Response } from 'express';
import { LoginUseCase } from '@/useCases/auth/login.usecase';
import { LogoutUseCase } from '@/useCases/auth/logout.usecase';
import { RefreshTokenUseCase } from '@/useCases/auth/refreshToken.usecase';
import { SetupTwoFactorUseCase } from '@/useCases/auth/setupTwoFactor.usecase';
import { VerifyTwoFactorUseCase } from '@/useCases/auth/verifyTwoFactor.usecase';
import { ForgotPasswordUseCase } from '@/useCases/auth/forgotPassword.usecase';
import { ResetPasswordUseCase } from '@/useCases/auth/resetPassword.usecase';
import { ChangePasswordUseCase } from '@/useCases/auth/changePassword.usecase';
import { RegisterUseCase } from '@/useCases/auth/register.usecase';
import { ListUsersUseCase } from '@/useCases/auth/listUsers.usecase';
import { GetUserByIdUseCase } from '@/useCases/auth/getUserById.usecase';
import { ChangeUserRoleUseCase } from '@/useCases/auth/changeUserRole.usecase';
import { ChangeUserStatusUseCase } from '@/useCases/auth/changeUserStatus.usecase';
import { log } from '@/config/logger';

/**
 * Controlador para autenticação
 */
export class AuthController {
  /**
   * Login com email e senha
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const loginUseCase = new LoginUseCase();
      const result = await loginUseCase.execute({ email, password });
      
      res.status(200).json(result);
    } catch (error) {
      log.error('Login failed', { error: error.message, email: req.body.email });
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
      });
    }
  }

  /**
   * Logout - invalidar token
   */
  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      const logoutUseCase = new LogoutUseCase();
      await logoutUseCase.execute({ refreshToken });
      
      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      log.error('Logout failed', { error: error.message });
      res.status(400).json({
        error: 'Logout failed',
        message: error.message,
      });
    }
  }

  /**
   * Refresh token para obter novo access token
   */
  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      const refreshTokenUseCase = new RefreshTokenUseCase();
      const result = await refreshTokenUseCase.execute({ refreshToken });
      
      res.status(200).json(result);
    } catch (error) {
      log.error('Token refresh failed', { error: error.message });
      res.status(401).json({
        error: 'Token refresh failed',
        message: error.message,
      });
    }
  }

  /**
   * Configurar autenticação de dois fatores
   */
  public async setupTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }
      
      const setupTwoFactorUseCase = new SetupTwoFactorUseCase();
      const result = await setupTwoFactorUseCase.execute({ userId });
      
      res.status(200).json(result);
    } catch (error) {
      log.error('2FA setup failed', { error: error.message, userId: req.user?.id });
      res.status(400).json({
        error: '2FA setup failed',
        message: error.message,
      });
    }
  }

  /**
   * Verificar código de autenticação de dois fatores
   */
  public async verifyTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token } = req.body;
      
      const verifyTwoFactorUseCase = new VerifyTwoFactorUseCase();
      const result = await verifyTwoFactorUseCase.execute({ userId, token });
      
      res.status(200).json(result);
    } catch (error) {
      log.error('2FA verification failed', { error: error.message });
      res.status(401).json({
        error: '2FA verification failed',
        message: error.message,
      });
    }
  }

  /**
   * Solicitar redefinição de senha
   */
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      const forgotPasswordUseCase = new ForgotPasswordUseCase();
      await forgotPasswordUseCase.execute({ email });
      
      // Não revelamos se o email existe ou não por segurança
      res.status(200).json({
        message: 'Se o email estiver registrado, você receberá instruções para redefinir sua senha',
      });
    } catch (error) {
      log.error('Forgot password failed', { error: error.message, email: req.body.email });
      // Mesmo em caso de erro, retornamos sucesso para não revelar se o email existe
      res.status(200).json({
        message: 'Se o email estiver registrado, você receberá instruções para redefinir sua senha',
      });
    }
  }

  /**
   * Redefinir senha com token
   */
  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      const resetPasswordUseCase = new ResetPasswordUseCase();
      await resetPasswordUseCase.execute({ token, newPassword });
      
      res.status(200).json({
        message: 'Senha redefinida com sucesso',
      });
    } catch (error) {
      log.error('Reset password failed', { error: error.message });
      res.status(400).json({
        error: 'Falha ao redefinir senha',
        message: error.message,
      });
    }
  }

  /**
   * Alterar senha (usuário autenticado)
   */
  public async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }
      
      const { currentPassword, newPassword } = req.body;
      
      const changePasswordUseCase = new ChangePasswordUseCase();
      await changePasswordUseCase.execute({ userId, currentPassword, newPassword });
      
      res.status(200).json({
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      log.error('Change password failed', { error: error.message, userId: req.user?.id });
      res.status(400).json({
        error: 'Falha ao alterar senha',
        message: error.message,
      });
    }
  }

  /**
   * Registrar novo usuário
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      
      const registerUseCase = new RegisterUseCase();
      const result = await registerUseCase.execute({ name, email, password });
      
      res.status(201).json(result);
    } catch (error) {
      log.error('Registration failed', { error: error.message, email: req.body.email });
      res.status(400).json({
        error: 'Registration failed',
        message: error.message,
      });
    }
  }

  /**
   * Listar todos os usuários (admin/HR)
   */
  public async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10' } = req.query;
      
      const listUsersUseCase = new ListUsersUseCase();
      const result = await listUsersUseCase.execute({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });
      
      res.status(200).json(result);
    } catch (error) {
      log.error('Error listing users', { error: error.message });
      res.status(500).json({
        error: 'Error listing users',
        message: error.message,
      });
    }
  }

  /**
   * Obter detalhes de um usuário pelo ID
   */
  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const getUserUseCase = new GetUserByIdUseCase();
      const result = await getUserUseCase.execute({ userId });
      
      if (!result) {
        res.status(404).json({
          error: 'User not found',
          message: `User with ID ${userId} not found`,
        });
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      log.error('Error getting user', { error: error.message, userId: req.params.userId });
      res.status(500).json({
        error: 'Error getting user',
        message: error.message,
      });
    }
  }

  /**
   * Alterar papel (role) do usuário
   */
  public async changeUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      const changeRoleUseCase = new ChangeUserRoleUseCase();
      const result = await changeRoleUseCase.execute({ userId, role });
      
      res.status(200).json(result);
    } catch (error) {
      log.error('Error changing user role', { 
        error: error.message, 
        userId: req.params.userId,
        role: req.body.role,
      });
      res.status(400).json({
        error: 'Error changing user role',
        message: error.message,
      });
    }
  }

  /**
   * Alterar status do usuário (ativar/desativar)
   */
  public async changeUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      
      const changeStatusUseCase = new ChangeUserStatusUseCase();
      const result = await changeStatusUseCase.execute({ userId, status });
      
      res.status(200).json(result);
    } catch (error) {
      log.error('Error changing user status', { 
        error: error.message, 
        userId: req.params.userId,
        status: req.body.status,
      });
      res.status(400).json({
        error: 'Error changing user status',
        message: error.message,
      });
    }
  }
} 