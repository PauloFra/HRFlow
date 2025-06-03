import { PrismaClient } from '@prisma/client';
import { log } from '@/config/logger';

class PrismaService {
  private static instance: PrismaService;
  private prismaClient: PrismaClient;

  private constructor() {
    this.prismaClient = new PrismaClient();
    
    // Configurar log simplificado para não depender de tipagem de eventos
    if (process.env.NODE_ENV !== 'production') {
      this.prismaClient.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        const duration = after - before;
        
        // Log de queries lentas (acima de 500ms)
        if (duration > 500) {
          log.warn('Slow query detected', {
            model: params.model,
            action: params.action,
            duration: `${duration}ms`,
          });
        }
        
        return result;
      });
    }
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  get prisma(): PrismaClient {
    return this.prismaClient;
  }

  async disconnect(): Promise<void> {
    await this.prismaClient.$disconnect();
  }
}

export default PrismaService; 