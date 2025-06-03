import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { log } from '@/config/logger';
import { env } from '@/config/env';
import fs from 'fs';
import path from 'path';

// Importar rotas
import authRoutes from '@/interfaces/routes/auth.routes';
import employeeRoutes from '@/interfaces/routes/employee.routes';
import userRoutes from '@/interfaces/routes/user.routes';
import auditRoutes from '@/interfaces/routes/audit.routes';

// Garantir que o diretório de logs exista
const logDir = path.resolve(process.cwd(), env.LOG_FILE_PATH || './logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Configura e retorna a aplicação Express
 */
export function createApp(): express.Application {
  const app = express();

  // Middlewares de segurança e performance
  app.use(helmet());
  app.use(compression());
  
  // Configuração de CORS
  app.use(cors({
    origin: env.NODE_ENV === 'production' 
      ? [env.FRONTEND_URL] 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 horas
  }));
  
  // Rate limiting para prevenir abusos
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos por padrão
    max: env.RATE_LIMIT_MAX_REQUESTS || 100, // limite de 100 requisições por janela
    message: 'Muitas requisições deste IP, tente novamente mais tarde',
    standardHeaders: true,
    legacyHeaders: false,
  }));
  
  // Parse de JSON e formulários
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // Logging de requisições para todas as rotas
  app.use((req, res, next) => {
    const start = Date.now();
    
    // Ao finalizar a resposta, registra o log
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { method, originalUrl, ip } = req;
      const { statusCode } = res;
      
      if (statusCode >= 400) {
        log.warn('Request failed', {
          method,
          url: originalUrl,
          statusCode,
          duration,
          ip,
        });
      } else {
        log.info('Request completed', {
          method,
          url: originalUrl,
          statusCode,
          duration,
          ip,
        });
      }
    });
    
    next();
  });
  
  // Health check route
  app.get('/health', async (req, res) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      log.error('Health check failed', { error: (error as Error).message });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      });
    }
  });

  // API base route
  app.get('/', (req, res) => {
    res.json({
      message: 'HRFlow API - Sistema de Gestão de RH',
      version: '1.0.0',
      documentation: '/docs',
      health: '/health',
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/audit', auditRoutes);
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });
  
  // Global error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    log.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ipAddress: req.ip,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    });
  });

  return app;
} 