import { Router } from 'express';
import { UserController } from '@/interfaces/controllers/user.controller';
import { authenticate } from '@/middleware/auth';
import { upload, cleanUploadedFiles } from '@/middleware/upload';
import { auditAccess, auditUpdate } from '@/middleware/audit';

/**
 * Rotas de perfil de usuário
 */
class UserRoutes {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  /**
   * Inicializa as rotas de perfil de usuário
   */
  private initializeRoutes(): void {
    // Rotas para o próprio perfil (usuário autenticado)
    this.router.get(
      '/profile',
      authenticate,
      auditAccess('user_profile'),
      this.userController.getOwnProfile
    );
    
    this.router.patch(
      '/profile',
      authenticate,
      auditUpdate('user_profile'),
      this.userController.updateOwnProfile
    );
    
    this.router.post(
      '/profile/photo',
      authenticate,
      upload.profilePhoto,
      cleanUploadedFiles,
      auditUpdate('user_profile_photo'),
      this.userController.uploadOwnProfilePhoto
    );
    
    this.router.delete(
      '/profile/photo',
      authenticate,
      auditUpdate('user_profile_photo'),
      this.userController.deleteOwnProfilePhoto
    );
  }
}

export default new UserRoutes().router; 