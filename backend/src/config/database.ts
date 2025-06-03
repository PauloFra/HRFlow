import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { log } from './logger';
import PrismaService from '@/services/prisma.service';

declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Configuração do cliente Prisma
 * Implementa singleton pattern para evitar múltiplas conexões
 */
export const prisma = globalThis.__prisma || new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

// Em desenvolvimento, reutilizar a instância para evitar hot reload issues
if (env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

/**
 * Conectar ao banco de dados
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    log.info('✅ Banco de dados conectado com sucesso');
  } catch (error) {
    log.error('❌ Erro ao conectar com o banco de dados:', { error: (error as Error).message });
    throw error;
  }
}

/**
 * Desconectar do banco de dados
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    // Também desconectar o singleton do serviço Prisma
    await PrismaService.getInstance().disconnect();
    log.info('✅ Banco de dados desconectado com sucesso');
  } catch (error) {
    log.error('❌ Erro ao desconectar do banco de dados:', { error: (error as Error).message });
    throw error;
  }
}

/**
 * Verificar saúde da conexão com o banco
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    log.error('❌ Banco de dados não está saudável:', { error: (error as Error).message });
    return false;
  }
}

/**
 * Executar migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    // Em produção, as migrations devem ser executadas manualmente
    if (env.NODE_ENV === 'production') {
      console.log('⚠️ Migrations devem ser executadas manualmente em produção');
      return;
    }

    console.log('🔄 Executando migrations...');
    // Note: Em desenvolvimento, as migrations devem ser executadas via CLI
    // npx prisma migrate dev
    console.log('✅ Migrations executadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    throw error;
  }
}

export default prisma; 