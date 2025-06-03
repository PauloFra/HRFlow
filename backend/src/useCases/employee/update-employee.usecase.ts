import { EmployeeRepository } from '@/repositories/employee.repository';
import { EmployeeDTO, UpdateEmployeeDTO } from '@/types/dto/employee.dto';
import { AppError } from '@/types';
import { log } from '@/config/logger';

/**
 * Caso de uso para atualização de funcionário
 */
export class UpdateEmployeeUseCase {
  constructor(
    private employeeRepository: EmployeeRepository
  ) {}

  /**
   * Executa o caso de uso
   */
  public async execute(id: string, data: UpdateEmployeeDTO): Promise<EmployeeDTO> {
    try {
      // Verifica se o funcionário existe
      const existingEmployee = await this.employeeRepository.findById(id);
      if (!existingEmployee) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      // Atualiza os dados do funcionário
      const updatedEmployee = await this.employeeRepository.update(id, data);

      if (!updatedEmployee) {
        throw new AppError('Erro ao atualizar funcionário', 500);
      }

      log.info('Employee updated successfully', { employeeId: id });
      return updatedEmployee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error updating employee', { error: (error as Error).message, employeeId: id });
      throw new AppError('Erro ao atualizar funcionário', 500);
    }
  }

  /**
   * Atualiza o status do funcionário
   */
  public async updateStatus(id: string, status: string): Promise<EmployeeDTO> {
    try {
      // Verifica se o funcionário existe
      const existingEmployee = await this.employeeRepository.findById(id);
      if (!existingEmployee) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      // Atualiza o status do funcionário
      const updatedEmployee = await this.employeeRepository.update(id, { status: status as any });

      if (!updatedEmployee) {
        throw new AppError('Erro ao atualizar status do funcionário', 500);
      }

      log.info('Employee status updated successfully', { employeeId: id, status });
      return updatedEmployee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error updating employee status', { error: (error as Error).message, employeeId: id });
      throw new AppError('Erro ao atualizar status do funcionário', 500);
    }
  }

  /**
   * Atualiza o departamento do funcionário
   */
  public async updateDepartment(id: string, departmentId: string): Promise<EmployeeDTO> {
    try {
      // Verifica se o funcionário existe
      const existingEmployee = await this.employeeRepository.findById(id);
      if (!existingEmployee) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      // Atualiza o departamento do funcionário
      const updatedEmployee = await this.employeeRepository.update(id, { departmentId });

      if (!updatedEmployee) {
        throw new AppError('Erro ao atualizar departamento do funcionário', 500);
      }

      log.info('Employee department updated successfully', { employeeId: id, departmentId });
      return updatedEmployee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error updating employee department', { error: (error as Error).message, employeeId: id });
      throw new AppError('Erro ao atualizar departamento do funcionário', 500);
    }
  }

  /**
   * Atualiza o gestor do funcionário
   */
  public async updateManager(id: string, managerId: string | null): Promise<EmployeeDTO> {
    try {
      // Verifica se o funcionário existe
      const existingEmployee = await this.employeeRepository.findById(id);
      if (!existingEmployee) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      // Verifica se o gestor existe (se for fornecido)
      if (managerId) {
        const manager = await this.employeeRepository.findById(managerId);
        if (!manager) {
          throw new AppError('Gestor não encontrado', 404);
        }
      }

      // Atualiza o gestor do funcionário
      const updatedEmployee = await this.employeeRepository.update(id, { managerId });

      if (!updatedEmployee) {
        throw new AppError('Erro ao atualizar gestor do funcionário', 500);
      }

      log.info('Employee manager updated successfully', { employeeId: id, managerId });
      return updatedEmployee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error updating employee manager', { error: (error as Error).message, employeeId: id });
      throw new AppError('Erro ao atualizar gestor do funcionário', 500);
    }
  }
} 