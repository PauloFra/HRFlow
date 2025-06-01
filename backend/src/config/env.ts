import dotenv from 'dotenv';
import Joi from 'joi';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Schema de validação para variáveis de ambiente
 */
const envSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  // Server
  PORT: Joi.number().positive().default(3001),
  HOST: Joi.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Redis
  REDIS_URL: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Kafka
  KAFKA_BROKERS: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().default('hrflow-backend'),
  KAFKA_GROUP_ID: Joi.string().default('hrflow-consumers'),

  // MinIO
  MINIO_ENDPOINT: Joi.string().required(),
  MINIO_PORT: Joi.number().positive().default(9000),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET_NAME: Joi.string().default('hrflow-uploads'),
  MINIO_USE_SSL: Joi.boolean().default(false),

  // Email
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().positive().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_FROM_NAME: Joi.string().default('HRFlow'),
  SMTP_FROM_EMAIL: Joi.string().email().required(),

  // Application URLs
  APP_URL: Joi.string().uri().required(),
  FRONTEND_URL: Joi.string().uri().required(),

  // File Upload
  MAX_FILE_SIZE: Joi.number().positive().default(10485760), // 10MB
  ALLOWED_FILE_TYPES: Joi.string().default('image/jpeg,image/png,image/gif,application/pdf'),

  // Security
  BCRYPT_ROUNDS: Joi.number().min(8).max(15).default(12),
  RATE_LIMIT_WINDOW_MS: Joi.number().positive().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().positive().default(100),

  // Two-Factor Authentication
  TWO_FACTOR_SERVICE_NAME: Joi.string().default('HRFlow'),
  TWO_FACTOR_ISSUER: Joi.string().default('HRFlow Inc'),

  // Geolocation
  GEOLOCATION_TOLERANCE_METERS: Joi.number().positive().default(100),

  // Logs
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  LOG_FILE_ENABLED: Joi.boolean().default(true),
  LOG_FILE_PATH: Joi.string().default('./logs'),

  // Monitoring
  HEALTH_CHECK_ENABLED: Joi.boolean().default(true),
  METRICS_ENABLED: Joi.boolean().default(true),

  // Development
  DEBUG: Joi.boolean().default(false),
  SWAGGER_ENABLED: Joi.boolean().default(true),
});

/**
 * Validar e transformar variáveis de ambiente
 */
const { error, value: envVars } = envSchema.validate(process.env, {
  allowUnknown: true,
  stripUnknown: true,
  abortEarly: false,
});

if (error) {
  throw new Error(`❌ Configuração de ambiente inválida: ${error.message}`);
}

/**
 * Configuração validada e tipada do ambiente
 */
export const env = {
  // Environment
  NODE_ENV: envVars.NODE_ENV as 'development' | 'test' | 'production',
  
  // Server
  PORT: envVars.PORT as number,
  HOST: envVars.HOST as string,
  
  // Database
  DATABASE_URL: envVars.DATABASE_URL as string,
  
  // Redis
  REDIS_URL: envVars.REDIS_URL as string,
  
  // JWT
  JWT_SECRET: envVars.JWT_SECRET as string,
  JWT_REFRESH_SECRET: envVars.JWT_REFRESH_SECRET as string,
  JWT_EXPIRES_IN: envVars.JWT_EXPIRES_IN as string,
  JWT_REFRESH_EXPIRES_IN: envVars.JWT_REFRESH_EXPIRES_IN as string,
  
  // Kafka
  KAFKA_BROKERS: envVars.KAFKA_BROKERS as string,
  KAFKA_CLIENT_ID: envVars.KAFKA_CLIENT_ID as string,
  KAFKA_GROUP_ID: envVars.KAFKA_GROUP_ID as string,
  
  // MinIO
  MINIO_ENDPOINT: envVars.MINIO_ENDPOINT as string,
  MINIO_PORT: envVars.MINIO_PORT as number,
  MINIO_ACCESS_KEY: envVars.MINIO_ACCESS_KEY as string,
  MINIO_SECRET_KEY: envVars.MINIO_SECRET_KEY as string,
  MINIO_BUCKET_NAME: envVars.MINIO_BUCKET_NAME as string,
  MINIO_USE_SSL: envVars.MINIO_USE_SSL as boolean,
  
  // Email
  SMTP_HOST: envVars.SMTP_HOST as string,
  SMTP_PORT: envVars.SMTP_PORT as number,
  SMTP_SECURE: envVars.SMTP_SECURE as boolean,
  SMTP_USER: envVars.SMTP_USER as string,
  SMTP_PASS: envVars.SMTP_PASS as string,
  SMTP_FROM_NAME: envVars.SMTP_FROM_NAME as string,
  SMTP_FROM_EMAIL: envVars.SMTP_FROM_EMAIL as string,
  
  // Application URLs
  APP_URL: envVars.APP_URL as string,
  FRONTEND_URL: envVars.FRONTEND_URL as string,
  
  // File Upload
  MAX_FILE_SIZE: envVars.MAX_FILE_SIZE as number,
  ALLOWED_FILE_TYPES: envVars.ALLOWED_FILE_TYPES as string,
  
  // Security
  BCRYPT_ROUNDS: envVars.BCRYPT_ROUNDS as number,
  RATE_LIMIT_WINDOW_MS: envVars.RATE_LIMIT_WINDOW_MS as number,
  RATE_LIMIT_MAX_REQUESTS: envVars.RATE_LIMIT_MAX_REQUESTS as number,
  
  // Two-Factor Authentication
  TWO_FACTOR_SERVICE_NAME: envVars.TWO_FACTOR_SERVICE_NAME as string,
  TWO_FACTOR_ISSUER: envVars.TWO_FACTOR_ISSUER as string,
  
  // Geolocation
  GEOLOCATION_TOLERANCE_METERS: envVars.GEOLOCATION_TOLERANCE_METERS as number,
  
  // Logs
  LOG_LEVEL: envVars.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug',
  LOG_FILE_ENABLED: envVars.LOG_FILE_ENABLED as boolean,
  LOG_FILE_PATH: envVars.LOG_FILE_PATH as string,
  
  // Monitoring
  HEALTH_CHECK_ENABLED: envVars.HEALTH_CHECK_ENABLED as boolean,
  METRICS_ENABLED: envVars.METRICS_ENABLED as boolean,
  
  // Development
  DEBUG: envVars.DEBUG as boolean,
  SWAGGER_ENABLED: envVars.SWAGGER_ENABLED as boolean,
} as const;

export default env; 