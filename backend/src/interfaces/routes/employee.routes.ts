import { Router } from 'express';
import { EmployeeController } from '@/interfaces/controllers/employee.controller';
import { authenticate, authorize, authorizeManager, authorizeEmployeeOwner } from '@/middleware/auth';
import { upload, cleanUploadedFiles } from '@/middleware/upload';

/**
 * Rotas para gestão de funcionários com RBAC
 */
class EmployeeRoutes {
  public router: Router;
  private employeeController: EmployeeController;

  constructor() {
    this.router = Router();
    this.employeeController = new EmployeeController();
    this.initializeRoutes();
  }

  /**
   * Inicializa as rotas de funcionários com controle de acesso
   */
  private initializeRoutes(): void {
    // Rotas que exigem autenticação básica
    this.router.use(authenticate);
    
    // Rota para obter o próprio perfil
    this.router.get('/profile', this.employeeController.getOwnProfile);
    
    // Rotas para gerenciamento (Admin e RH)
    this.router.get(
      '/',
      authorize('ADMIN', 'HR'),
      this.employeeController.getAllEmployees
    );
    
    this.router.post(
      '/',
      authorize('ADMIN', 'HR'),
      this.employeeController.createEmployee
    );
    
    // Rotas para detalhes específicos de funcionário
    this.router.get(
      '/:employeeId',
      authorizeEmployeeOwner(),
      this.employeeController.getEmployeeById
    );
    
    this.router.patch(
      '/:employeeId',
      authorizeEmployeeOwner(),
      this.employeeController.updateEmployee
    );
    
    // Rotas para foto de perfil
    this.router.post(
      '/:employeeId/profile-photo',
      authorizeEmployeeOwner(),
      upload.profilePhoto,
      cleanUploadedFiles,
      this.employeeController.uploadProfilePhoto
    );
    
    this.router.delete(
      '/:employeeId/profile-photo',
      authorizeEmployeeOwner(),
      this.employeeController.deleteProfilePhoto
    );
    
    // Rotas específicas para gerentes
    this.router.get(
      '/:employeeId/subordinates',
      authorizeManager(),
      this.employeeController.getSubordinates
    );
    
    // Rotas para administração (somente Admin e RH)
    this.router.delete(
      '/:employeeId',
      authorize('ADMIN', 'HR'),
      this.employeeController.deleteEmployee
    );
    
    // Rotas para ativação/desativação
    this.router.patch(
      '/:employeeId/status',
      authorize('ADMIN', 'HR'),
      this.employeeController.changeEmployeeStatus
    );
    
    // Rotas para departamentos
    this.router.get(
      '/departments',
      authorize('ADMIN', 'HR', 'MANAGER'),
      this.employeeController.getAllDepartments
    );
    
    // Rotas para posições/cargos
    this.router.get(
      '/positions',
      authorize('ADMIN', 'HR', 'MANAGER'),
      this.employeeController.getAllPositions
    );
  }
}

export default new EmployeeRoutes().router; 