import { EmployeeRepository } from '@/repositories/employee.repository';
import { AppError } from '@/types';
import { log } from '@/config/logger';

/**
 * Caso de uso para exclusão de funcionário
 */
export class DeleteEmployeeUseCase {
  constructor(
    private employeeRepository: EmployeeRepository
  ) {}

  /**
   * Executa o caso de uso
   */
  public async execute(id: string): Promise<boolean> {
    try {
      // Verifica se o funcionário existe
      const existingEmployee = await this.employeeRepository.findById(id);
      if (!existingEmployee) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      // Verifica se o funcionário possui subordinados
      const subordinates = await this.employeeRepository.findByManager(id, { limit: 1 });
      if (subordinates.data.length > 0) {
        throw new AppError('Não é possível excluir um funcionário que possui subordinados', 400);
      }

      // Exclui o funcionário
      const result = await this.employeeRepository.delete(id);

      log.info('Employee deleted successfully', { employeeId: id });
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error deleting employee', { error: (error as Error).message, employeeId: id });
      throw new AppError('Erro ao excluir funcionário', 500);
    }
  }
} 