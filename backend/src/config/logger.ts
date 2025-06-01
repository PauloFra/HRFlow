import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from './env';

/**
 * Configuração de formatos para logs
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

/**
 * Transports para diferentes ambientes
 */
const transports: winston.transport[] = [];

// Console transport (sempre ativo)
transports.push(
  new winston.transports.Console({
    format: env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    level: env.LOG_LEVEL,
  })
);

// File transport (se habilitado)
if (env.LOG_FILE_ENABLED) {
  // Log de erros
  transports.push(
    new DailyRotateFile({
      filename: `${env.LOG_FILE_PATH}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: `${env.LOG_FILE_PATH}/error-audit.json`,
    })
  );

  // Log combinado
  transports.push(
    new DailyRotateFile({
      filename: `${env.LOG_FILE_PATH}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: `${env.LOG_FILE_PATH}/combined-audit.json`,
    })
  );

  // Log de aplicação (sem erros)
  transports.push(
    new DailyRotateFile({
      filename: `${env.LOG_FILE_PATH}/app-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '30d',
      auditFile: `${env.LOG_FILE_PATH}/app-audit.json`,
    })
  );
}

/**
 * Instância principal do logger
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: 'hrflow-backend',
    environment: env.NODE_ENV,
  },
  transports,
  // Não sair do processo em caso de erro
  exitOnError: false,
});

/**
 * Logger especializado para auditoria
 */
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'hrflow-audit',
    type: 'audit',
  },
  transports: [
    new DailyRotateFile({
      filename: `${env.LOG_FILE_PATH}/audit-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '90d',
      auditFile: `${env.LOG_FILE_PATH}/audit-audit.json`,
    }),
  ],
});

/**
 * Logger para performance
 */
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'hrflow-performance',
    type: 'performance',
  },
  transports: [
    new DailyRotateFile({
      filename: `${env.LOG_FILE_PATH}/performance-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      auditFile: `${env.LOG_FILE_PATH}/performance-audit.json`,
    }),
  ],
});

/**
 * Logger para eventos de negócio
 */
export const businessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'hrflow-business',
    type: 'business',
  },
  transports: [
    new DailyRotateFile({
      filename: `${env.LOG_FILE_PATH}/business-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      auditFile: `${env.LOG_FILE_PATH}/business-audit.json`,
    }),
  ],
});

/**
 * Tipos para contexto de log
 */
export interface LogContext {
  userId?: string;
  employeeId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: any;
}

/**
 * Wrapper para logs com contexto
 */
class ContextualLogger {
  constructor(private baseLogger: winston.Logger) {}

  private formatMessage(message: string, context?: LogContext): [string, LogContext?] {
    if (!context) return [message];
    
    const { userId, employeeId, requestId, ...meta } = context;
    const prefix = [userId, employeeId, requestId].filter(Boolean).join('|');
    const finalMessage = prefix ? `[${prefix}] ${message}` : message;
    
    return [finalMessage, meta];
  }

  error(message: string, context?: LogContext): void {
    const [msg, meta] = this.formatMessage(message, context);
    this.baseLogger.error(msg, meta);
  }

  warn(message: string, context?: LogContext): void {
    const [msg, meta] = this.formatMessage(message, context);
    this.baseLogger.warn(msg, meta);
  }

  info(message: string, context?: LogContext): void {
    const [msg, meta] = this.formatMessage(message, context);
    this.baseLogger.info(msg, meta);
  }

  debug(message: string, context?: LogContext): void {
    const [msg, meta] = this.formatMessage(message, context);
    this.baseLogger.debug(msg, meta);
  }
}

/**
 * Instâncias contextuais dos loggers
 */
export const log = new ContextualLogger(logger);
export const audit = new ContextualLogger(auditLogger);
export const performance = new ContextualLogger(performanceLogger);
export const business = new ContextualLogger(businessLogger);

/**
 * Helper para logs de requisições HTTP
 */
export function logRequest(context: LogContext & {
  method: string;
  endpoint: string;
  statusCode: number;
  duration: number;
}): void {
  const level = context.statusCode >= 400 ? 'warn' : 'info';
  const message = `${context.method} ${context.endpoint} - ${context.statusCode} (${context.duration}ms)`;
  
  performance[level](message, context);
}

/**
 * Helper para logs de auditoria
 */
export function logAudit(
  action: string,
  resource: string,
  context: LogContext & {
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
  }
): void {
  const message = `${action} ${resource}${context.resourceId ? ` [${context.resourceId}]` : ''}`;
  audit.info(message, context);
}

/**
 * Helper para logs de eventos de negócio
 */
export function logBusiness(
  event: string,
  context: LogContext & {
    entityType?: string;
    entityId?: string;
    metadata?: any;
  }
): void {
  business.info(event, context);
}

export default logger; 