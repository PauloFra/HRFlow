import { EmployeeRepository } from '@/repositories/employee.repository';
import { UserRepository } from '@/repositories/user.repository';
import { CreateEmployeeDTO, EmployeeDTO } from '@/types/dto/employee.dto';
import { AppError } from '@/types';
import { log } from '@/config/logger';

/**
 * Caso de uso para criação de funcionário
 */
export class CreateEmployeeUseCase {
  constructor(
    private employeeRepository: EmployeeRepository,
    private userRepository: UserRepository
  ) {}

  /**
   * Executa o caso de uso
   */
  public async execute(data: CreateEmployeeDTO): Promise<EmployeeDTO> {
    try {
      // Verifica se o usuário existe
      const user = await this.userRepository.findById(data.userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Verifica se já existe funcionário com este CPF
      const existingEmployeeByCpf = await this.employeeRepository.findByCpf(data.cpf);
      if (existingEmployeeByCpf) {
        throw new AppError('Já existe um funcionário cadastrado com este CPF', 400);
      }

      // Verifica se já existe funcionário vinculado a este usuário
      const existingEmployeeByUserId = await this.employeeRepository.findByUserId(data.userId);
      if (existingEmployeeByUserId) {
        throw new AppError('Este usuário já está vinculado a um funcionário', 400);
      }

      // Cria o funcionário
      const employee = await this.employeeRepository.create(data);

      log.info('Employee created successfully', { employeeId: employee.id });
      return employee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error creating employee', { error: (error as Error).message });
      throw new AppError('Erro ao criar funcionário', 500);
    }
  }
} 