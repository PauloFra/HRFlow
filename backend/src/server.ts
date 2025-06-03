import 'express-async-errors';
import { Server } from 'http';
import { createApp } from './app';
import { env } from '@/config/env';
import { log } from '@/config/logger';
import { connectDatabase, disconnectDatabase } from '@/config/database';

/**
 * Classe principal da aplicação
 */
class HRFlowServer {
  public server: Server | null = null;
  
  /**
   * Inicializa e inicia o servidor
   */
  public async start(): Promise<void> {
    try {
      // Conectar ao banco de dados
      await connectDatabase();
      log.info('Database connection established');
      
      // Criar aplicação Express
      const app = createApp();
      
      // Iniciar servidor HTTP
      const port = env.PORT || 3001;
      const host = env.HOST || '0.0.0.0';
      
      this.server = app.listen(port, host, () => {
        log.info(`Server running at http://${host}:${port}`);
        log.info(`Environment: ${env.NODE_ENV}`);
      });
      
      // Configurar tratamento de erros e shutdown gracioso
      this.setupGracefulShutdown();
      
    } catch (error) {
      log.error('Failed to start server', { error: (error as Error).message });
      process.exit(1);
    }
  }
  
  /**
   * Configura o shutdown gracioso do servidor
   */
  private setupGracefulShutdown(): void {
    // Lidar com sinais de término
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        log.info(`${signal} received, shutting down gracefully`);
        
        if (this.server) {
          this.server.close(async () => {
            log.info('HTTP server closed');
            
            // Desconectar do banco de dados
            await disconnectDatabase();
            log.info('Database connections closed');
            
            process.exit(0);
          });
          
          // Timeout forçado para shutdown após 10 segundos
          setTimeout(() => {
            log.error('Forced shutdown after timeout');
            process.exit(1);
          }, 10000);
        }
      });
    });
  }
}

// Iniciar servidor quando este arquivo for executado diretamente
if (require.main === module) {
  const server = new HRFlowServer();
  server.start();
}

export default new HRFlowServer(); 