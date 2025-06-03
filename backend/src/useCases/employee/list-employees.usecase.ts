import { EmployeeRepository } from '@/repositories/employee.repository';
import { EmployeeDTO } from '@/types/dto/employee.dto';
import { FindAllOptions, PaginatedResult } from '@/repositories/base.repository';
import { AppError } from '@/types';
import { log } from '@/config/logger';

/**
 * Caso de uso para listar funcionários
 */
export class ListEmployeesUseCase {
  constructor(
    private employeeRepository: EmployeeRepository
  ) {}

  /**
   * Lista todos os funcionários com paginação e filtros
   */
  public async execute(options: FindAllOptions = {}): Promise<PaginatedResult<EmployeeDTO>> {
    try {
      return await this.employeeRepository.findAll(options);
    } catch (error) {
      log.error('Error listing employees', { error: (error as Error).message });
      throw new AppError('Erro ao listar funcionários', 500);
    }
  }

  /**
   * Lista funcionários por departamento
   */
  public async getByDepartment(departmentId: string, options: FindAllOptions = {}): Promise<PaginatedResult<EmployeeDTO>> {
    try {
      return await this.employeeRepository.findByDepartment(departmentId, options);
    } catch (error) {
      log.error('Error listing employees by department', { error: (error as Error).message, departmentId });
      throw new AppError('Erro ao listar funcionários por departamento', 500);
    }
  }

  /**
   * Lista funcionários por gestor
   */
  public async getByManager(managerId: string, options: FindAllOptions = {}): Promise<PaginatedResult<EmployeeDTO>> {
    try {
      return await this.employeeRepository.findByManager(managerId, options);
    } catch (error) {
      log.error('Error listing employees by manager', { error: (error as Error).message, managerId });
      throw new AppError('Erro ao listar funcionários por gestor', 500);
    }
  }

  /**
   * Conta o número total de funcionários com filtros opcionais
   */
  public async count(filter: any = {}): Promise<number> {
    try {
      return await this.employeeRepository.count(filter);
    } catch (error) {
      log.error('Error counting employees', { error: (error as Error).message });
      throw new AppError('Erro ao contar funcionários', 500);
    }
  }
} 