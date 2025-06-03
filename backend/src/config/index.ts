/**
 * Configurações globais da aplicação
 */
export const config = {
  // Configurações do JWT
  jwt: {
    secret: 'hrflow_jwt_secret_key_development_only',
    refreshSecret: 'hrflow_jwt_refresh_secret_key_development_only',
    passwordResetSecret: 'hrflow_jwt_password_reset_key_development_only',
    issuer: 'hrflow-api',
    audience: 'hrflow-client',
    accessExpiration: '1h',
    refreshExpiration: '7d',
    passwordResetExpiration: '1h',
  },
  
  // Configurações do servidor
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
  
  // Configurações de email
  email: {
    host: 'mailhog',
    port: 1025,
    user: '',
    pass: '',
    from: '"HRFlow" <no-reply@hrflow.app>',
  },

  // URLs da aplicação
  app: {
    url: 'http://localhost:3001',
    frontendUrl: 'http://localhost:3000',
  },
  
  // Configurações de upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    uploadDir: 'uploads',
  },
  
  // Configurações de cors
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
}; 