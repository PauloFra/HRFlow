import { Router } from 'express';
import { AuditController } from '@/interfaces/controllers/audit.controller';
import { authenticate, authorize } from '@/middleware/auth';

/**
 * Rotas para o sistema de auditoria
 */
class AuditRoutes {
  public router: Router;
  private auditController: AuditController;

  constructor() {
    this.router = Router();
    this.auditController = new AuditController();
    this.initializeRoutes();
  }

  /**
   * Inicializa as rotas de auditoria (somente ADMIN e HR)
   */
  private initializeRoutes(): void {
    // Proteger todas as rotas de auditoria
    this.router.use(authenticate);
    this.router.use(authorize('ADMIN', 'HR'));
    
    // Rotas para listagem e detalhes
    this.router.get('/', this.auditController.getAuditLogs);
    this.router.get('/stats', this.auditController.getAuditStats);
    this.router.get('/:id', this.auditController.getAuditLogById);
  }
}

export default new AuditRoutes().router; 