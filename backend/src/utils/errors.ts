/**
 * Erro base da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401, true);
  }
}

/**
 * Erro de autorização
 */
export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 403, true);
  }
}

/**
 * Erro de não encontrado
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, true);
  }
}

/**
 * Erro de conflito
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
  }
}

/**
 * Erro de serviço indisponível
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 503, true);
  }
}

/**
 * Verificar se um erro é uma instância de AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

/**
 * Converter erro desconhecido para AppError
 */
export const convertToAppError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  return new AppError(message, 500, false);
}; 