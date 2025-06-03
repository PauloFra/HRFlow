import { EmployeeRepository } from '@/repositories/employee.repository';
import { EmployeeDTO } from '@/types/dto/employee.dto';
import { AppError } from '@/types';
import { log } from '@/config/logger';

/**
 * Caso de uso para buscar detalhes de um funcionário
 */
export class GetEmployeeUseCase {
  constructor(
    private employeeRepository: EmployeeRepository
  ) {}

  /**
   * Busca funcionário por ID
   */
  public async getById(id: string): Promise<EmployeeDTO> {
    try {
      const employee = await this.employeeRepository.findById(id);
      
      if (!employee) {
        throw new AppError('Funcionário não encontrado', 404);
      }
      
      return employee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error getting employee by ID', { error: (error as Error).message, employeeId: id });
      throw new AppError('Erro ao buscar funcionário', 500);
    }
  }

  /**
   * Busca funcionário por número de matrícula
   */
  public async getByEmployeeNumber(employeeNumber: string): Promise<EmployeeDTO> {
    try {
      const employee = await this.employeeRepository.findByEmployeeNumber(employeeNumber);
      
      if (!employee) {
        throw new AppError('Funcionário não encontrado', 404);
      }
      
      return employee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error getting employee by number', { error: (error as Error).message, employeeNumber });
      throw new AppError('Erro ao buscar funcionário', 500);
    }
  }

  /**
   * Busca funcionário por CPF
   */
  public async getByCpf(cpf: string): Promise<EmployeeDTO> {
    try {
      const employee = await this.employeeRepository.findByCpf(cpf);
      
      if (!employee) {
        throw new AppError('Funcionário não encontrado', 404);
      }
      
      return employee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error getting employee by CPF', { error: (error as Error).message, cpf });
      throw new AppError('Erro ao buscar funcionário', 500);
    }
  }

  /**
   * Busca funcionário por ID de usuário
   */
  public async getByUserId(userId: string): Promise<EmployeeDTO> {
    try {
      const employee = await this.employeeRepository.findByUserId(userId);
      
      if (!employee) {
        throw new AppError('Funcionário não encontrado', 404);
      }
      
      return employee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error getting employee by user ID', { error: (error as Error).message, userId });
      throw new AppError('Erro ao buscar funcionário', 500);
    }
  }
} 