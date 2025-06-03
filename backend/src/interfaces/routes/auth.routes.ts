import { Router } from 'express';
import { AuthController } from '@/interfaces/controllers/auth.controller';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@/types';

/**
 * Rotas de autenticação
 */
class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  /**
   * Inicializa as rotas de autenticação
   */
  private initializeRoutes(): void {
    // Rotas públicas
    this.router.post('/login', this.authController.login);
    this.router.post('/refresh-token', this.authController.refreshToken);
    this.router.post('/forgot-password', this.authController.forgotPassword);
    this.router.post('/reset-password', this.authController.resetPassword);
    this.router.post('/register', this.authController.register);
    
    // Rotas autenticadas
    this.router.post('/logout', authenticate, this.authController.logout);
    this.router.post('/change-password', authenticate, this.authController.changePassword);
    
    // Rotas 2FA (autenticadas)
    this.router.post('/2fa/setup', authenticate, this.authController.setupTwoFactor);
    this.router.post('/2fa/verify', authenticate, this.authController.verifyTwoFactor);
    
    // Rotas administrativas (somente admin e RH)
    this.router.get('/users', 
      authenticate, 
      authorize('ADMIN', 'HR'), 
      this.authController.listUsers
    );
    
    this.router.get('/users/:userId', 
      authenticate, 
      authorize('ADMIN', 'HR'), 
      this.authController.getUserById
    );
    
    this.router.patch('/users/:userId/role', 
      authenticate, 
      authorize('ADMIN'), 
      this.authController.changeUserRole
    );
    
    this.router.patch('/users/:userId/status', 
      authenticate, 
      authorize('ADMIN', 'HR'), 
      this.authController.changeUserStatus
    );
  }
}

export default new AuthRoutes().router; 