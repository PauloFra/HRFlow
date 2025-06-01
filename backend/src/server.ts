import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server } from 'http';

import { env } from '@/config/env';
import { log } from '@/config/logger';
import { connectDatabase, checkDatabaseHealth } from '@/config/database';

/**
 * Classe principal da aplicação
 */
class HRFlowServer {
  public app: express.Application;
  public server: Server | null = null;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Configurar middlewares básicos
   */
  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [env.FRONTEND_URL];
        
        if (env.NODE_ENV === 'development') {
          allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS policy violation'));
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      message: {
        error: 'Too many requests from this IP',
        retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000 / 60), // minutes
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Request logging middleware
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        log.info('Request completed', {
          method: req.method,
          endpoint: req.path,
          statusCode: res.statusCode,
          duration,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      });

      next();
    });
  }

  /**
   * Configurar rotas da aplicação
   */
  private initializeRoutes(): void {
    // Health check route
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await checkDatabaseHealth();
        
        const healthStatus = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: env.NODE_ENV,
          version: process.env.npm_package_version || '1.0.0',
          uptime: process.uptime(),
          database: dbHealth ? 'connected' : 'disconnected',
          memory: process.memoryUsage(),
        };

        res.status(dbHealth ? 200 : 503).json(healthStatus);
      } catch (error) {
        log.error('Health check failed', { error: error.message });
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Service unavailable',
        });
      }
    });

    // API base route
    this.app.get('/', (req, res) => {
      res.json({
        message: 'HRFlow API - Sistema de Gestão de RH',
        version: '1.0.0',
        documentation: '/docs',
        health: '/health',
      });
    });

    // TODO: Add API routes
    // this.app.use('/api/auth', authRoutes);
    // this.app.use('/api/employees', employeeRoutes);
    // this.app.use('/api/time-tracking', timeTrackingRoutes);
    // this.app.use('/api/leaves', leaveRoutes);
    // this.app.use('/api/news', newsRoutes);
    // this.app.use('/api/events', eventRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
    });
  }

  /**
   * Configurar tratamento de erros
   */
  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      log.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        endpoint: req.path,
        ipAddress: req.ip,
      });

      // Don't leak error details in production
      const errorResponse = {
        error: 'Internal server error',
        message: env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        ...(env.NODE_ENV === 'development' && { stack: error.stack }),
      };

      res.status(500).json(errorResponse);
    });
  }

  /**
   * Iniciar servidor
   */
  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      
      // Start server
      this.server = this.app.listen(env.PORT, env.HOST, () => {
        log.info('🚀 HRFlow Server started successfully', {
          port: env.PORT,
          host: env.HOST,
          environment: env.NODE_ENV,
          processId: process.pid,
        });
      });

      // Handle server errors
      this.server.on('error', (error: Error) => {
        log.error('Server error', { error: error.message });
        throw error;
      });

    } catch (error) {
      log.error('Failed to start server', { error: error.message });
      throw error;
    }
  }

  /**
   * Parar servidor gracefully
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      log.info('Stopping server...');
      
      this.server.close((error) => {
        if (error) {
          log.error('Error stopping server', { error: error.message });
          reject(error);
        } else {
          log.info('Server stopped successfully');
          resolve();
        }
      });
    });
  }
}

/**
 * Instância global do servidor
 */
const server = new HRFlowServer();

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', async () => {
  log.info('SIGTERM received, starting graceful shutdown...');
  try {
    await server.stop();
    process.exit(0);
  } catch (error) {
    log.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  log.info('SIGINT received, starting graceful shutdown...');
  try {
    await server.stop();
    process.exit(0);
  } catch (error) {
    log.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  log.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  log.error('Unhandled promise rejection', { reason: reason?.message || reason });
  process.exit(1);
});

/**
 * Start server if this file is run directly
 */
if (require.main === module) {
  server.start().catch((error) => {
    log.error('Failed to start application', { error: error.message });
    process.exit(1);
  });
}

export default server;
export { HRFlowServer }; 