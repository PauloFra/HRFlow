import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { auditLogger } from '@/config/logger';
import { PrismaClient } from '@prisma/client';
import { AuditAction } from '@/types';

const prisma = new PrismaClient();

/**
 * Middleware para registro de auditoria
 * Captura informações da requisição e registra na tabela de logs
 */
export const auditMiddleware = (action: AuditAction, resource: string, customData?: (req: Request) => any) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Captura a resposta original para poder auditar após a conclusão
    const originalSend = res.send;
    
    // Substitui o método send para capturar o momento da resposta
    res.send = function(body?: any): Response {
      // Restaura o método original para evitar loops
      res.send = originalSend;
      
      // Chama o método original com os argumentos passados
      const result = originalSend.call(this, body);
      
      // Se a resposta foi bem-sucedida, registra o log de auditoria
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.userId;
        const resourceId = req.params.id || req.params.userId || req.params.employeeId;
        
        // Dados adicionais customizados ou valores do corpo da requisição
        let oldValues = undefined;
        let newValues = undefined;
        
        if (customData) {
          const custom = customData(req);
          oldValues = custom.oldValues;
          newValues = custom.newValues;
        } else if (req.method !== 'GET' && req.body) {
          newValues = req.body;
        }
        
        // Informações básicas do request
        const metadata = {
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path,
          query: req.query,
        };
        
        // Log no sistema de arquivo
        auditLogger.info(`${action} ${resource}`, {
          userId,
          resourceId,
          oldValues,
          newValues,
          metadata,
          ipAddress: req.ip,
        });
        
        // Inserir no banco de dados de forma assíncrona (não bloqueia o fluxo)
        prisma.auditLog.create({
          data: {
            userId,
            action,
            resource,
            resourceId,
            oldValues: oldValues ? JSON.stringify(oldValues) : null,
            newValues: newValues ? JSON.stringify(newValues) : null,
            metadata: JSON.stringify(metadata),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
            endpoint: req.originalUrl,
          },
        }).catch(error => {
          auditLogger.error('Falha ao registrar log de auditoria no banco de dados', { error });
        });
      }
      
      return result;
    };
    
    next();
  };
};

/**
 * Middleware simplificado para auditoria de acessos (GET)
 */
export const auditAccess = (resource: string) => {
  return auditMiddleware(AuditAction.ACCESS, resource);
};

/**
 * Middleware para auditoria de criação
 */
export const auditCreate = (resource: string) => {
  return auditMiddleware(AuditAction.CREATE, resource);
};

/**
 * Middleware para auditoria de atualização
 */
export const auditUpdate = (resource: string) => {
  return auditMiddleware(AuditAction.UPDATE, resource);
};

/**
 * Middleware para auditoria de exclusão
 */
export const auditDelete = (resource: string) => {
  return auditMiddleware(AuditAction.DELETE, resource);
}; 