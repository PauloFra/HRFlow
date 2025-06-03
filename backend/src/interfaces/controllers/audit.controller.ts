import { Request, Response } from 'express';
import { log } from '@/config/logger';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '@/middleware/auth';
import { AppError } from '@/types';

const prisma = new PrismaClient();

/**
 * Controlador para operações com logs de auditoria
 */
export class AuditController {
  /**
   * Obter logs de auditoria com paginação e filtros
   */
  public async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '20', resource, action, userId, startDate, endDate } = req.query;
      
      // Converter parâmetros
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;
      
      // Construir filtro
      const where: any = {};
      
      if (resource) {
        where.resource = resource as string;
      }
      
      if (action) {
        where.action = action as string;
      }
      
      if (userId) {
        where.userId = userId as string;
      }
      
      // Filtro de data
      if (startDate || endDate) {
        where.createdAt = {};
        
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }
      
      // Buscar total de registros
      const total = await prisma.auditLog.count({ where });
      
      // Buscar logs com paginação
      const logs = await prisma.auditLog.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      });
      
      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limitNumber);
      const hasNext = pageNumber < totalPages;
      const hasPrev = pageNumber > 1;
      
      res.status(200).json({
        success: true,
        data: logs,
        meta: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      });
    } catch (error: any) {
      log.error('Error fetching audit logs', { error: error.message });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar logs de auditoria',
      });
    }
  }
  
  /**
   * Obter detalhes de um log de auditoria específico
   */
  public async getAuditLogById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const log = await prisma.auditLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      });
      
      if (!log) {
        res.status(404).json({
          success: false,
          message: 'Log de auditoria não encontrado',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error: any) {
      log.error('Error fetching audit log details', { error: error.message, logId: req.params.id });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar detalhes do log de auditoria',
      });
    }
  }
  
  /**
   * Obter estatísticas de auditoria
   */
  public async getAuditStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Contagem por recurso
      const resourceStats = await prisma.$queryRaw`
        SELECT resource, COUNT(*) as count
        FROM audit_logs
        GROUP BY resource
        ORDER BY count DESC
        LIMIT 10
      `;
      
      // Contagem por ação
      const actionStats = await prisma.$queryRaw`
        SELECT action, COUNT(*) as count
        FROM audit_logs
        GROUP BY action
        ORDER BY count DESC
      `;
      
      // Contagem por usuário (top 10)
      const userStats = await prisma.$queryRaw`
        SELECT audit_logs.user_id as userId, users.username, users.email, COUNT(*) as count
        FROM audit_logs
        LEFT JOIN users ON audit_logs.user_id = users.id
        WHERE audit_logs.user_id IS NOT NULL
        GROUP BY audit_logs.user_id, users.username, users.email
        ORDER BY count DESC
        LIMIT 10
      `;
      
      // Contagem por dia (últimos 30 dias)
      const dateStats = await prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM audit_logs
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      
      res.status(200).json({
        success: true,
        data: {
          byResource: resourceStats,
          byAction: actionStats,
          byUser: userStats,
          byDate: dateStats,
        },
      });
    } catch (error: any) {
      log.error('Error fetching audit statistics', { error: error.message });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas de auditoria',
      });
    }
  }
} 