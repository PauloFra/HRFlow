import { PrismaClient, Employee } from '@prisma/client';
import { BaseRepository, FindAllOptions, PaginatedResult } from './base.repository';
import { EmployeeDTO, CreateEmployeeDTO, UpdateEmployeeDTO } from '@/types/dto/employee.dto';
import { log } from '@/config/logger';

/**
 * Repositório para operações com funcionários
 */
export class EmployeeRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  /**
   * Busca funcionário por ID
   */
  public async findById(id: string): Promise<EmployeeDTO | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { id },
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      if (!employee) return null;

      return this.mapToEmployeeDTO(employee);
    } catch (error) {
      log.error('Error finding employee by ID', { error: (error as Error).message, employeeId: id });
      throw error;
    }
  }

  /**
   * Busca funcionário por número de matrícula
   */
  public async findByEmployeeNumber(employeeNumber: string): Promise<EmployeeDTO | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { employeeNumber },
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      if (!employee) return null;

      return this.mapToEmployeeDTO(employee);
    } catch (error) {
      log.error('Error finding employee by number', { error: (error as Error).message, employeeNumber });
      throw error;
    }
  }

  /**
   * Busca funcionário por CPF
   */
  public async findByCpf(cpf: string): Promise<EmployeeDTO | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { cpf },
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      if (!employee) return null;

      return this.mapToEmployeeDTO(employee);
    } catch (error) {
      log.error('Error finding employee by CPF', { error: (error as Error).message, cpf });
      throw error;
    }
  }

  /**
   * Busca funcionário pelo ID do usuário
   */
  public async findByUserId(userId: string): Promise<EmployeeDTO | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { userId },
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      if (!employee) return null;

      return this.mapToEmployeeDTO(employee);
    } catch (error) {
      log.error('Error finding employee by user ID', { error: (error as Error).message, userId });
      throw error;
    }
  }

  /**
   * Cria um novo funcionário
   */
  public async create(data: CreateEmployeeDTO): Promise<EmployeeDTO> {
    try {
      // Gera número de matrícula sequencial baseado na data atual e um número aleatório
      const employeeNumber = `EMP${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
      
      const employee = await this.prisma.employee.create({
        data: {
          ...data,
          employeeNumber,
          fullName: `${data.firstName} ${data.lastName}`,
        },
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return this.mapToEmployeeDTO(employee);
    } catch (error) {
      log.error('Error creating employee', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Atualiza dados do funcionário
   */
  public async update(id: string, data: UpdateEmployeeDTO): Promise<EmployeeDTO | null> {
    try {
      // Se os nomes foram atualizados, recalcula o nome completo
      let updateData = { ...data };
      if (data.firstName && data.lastName) {
        updateData = {
          ...updateData,
          fullName: `${data.firstName} ${data.lastName}`,
        };
      } else if (data.firstName) {
        const employee = await this.prisma.employee.findUnique({
          where: { id },
          select: { lastName: true },
        });
        if (employee) {
          updateData = {
            ...updateData,
            fullName: `${data.firstName} ${employee.lastName}`,
          };
        }
      } else if (data.lastName) {
        const employee = await this.prisma.employee.findUnique({
          where: { id },
          select: { firstName: true },
        });
        if (employee) {
          updateData = {
            ...updateData,
            fullName: `${employee.firstName} ${data.lastName}`,
          };
        }
      }

      const employee = await this.prisma.employee.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return this.mapToEmployeeDTO(employee);
    } catch (error) {
      log.error('Error updating employee', { error: (error as Error).message, employeeId: id });
      throw error;
    }
  }

  /**
   * Lista todos os funcionários com paginação
   */
  public async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<EmployeeDTO>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fullName',
        sortOrder = 'asc',
        filter = {},
      } = options;

      const skip = (page - 1) * limit;

      // Conta o total de registros para paginação
      const total = await this.prisma.employee.count({
        where: filter,
      });

      const employees = await this.prisma.employee.findMany({
        skip,
        take: limit,
        where: filter,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);
      
      return {
        data: employees.map(employee => this.mapToEmployeeDTO(employee)),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      log.error('Error listing employees', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Exclui um funcionário
   */
  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.employee.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      log.error('Error deleting employee', { error: (error as Error).message, employeeId: id });
      throw error;
    }
  }

  /**
   * Conta o número de funcionários com filtro opcional
   */
  public async count(filter: any = {}): Promise<number> {
    try {
      return await this.prisma.employee.count({
        where: filter,
      });
    } catch (error) {
      log.error('Error counting employees', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Busca funcionários subordinados a um gestor
   */
  public async findByManager(managerId: string, options: FindAllOptions = {}): Promise<PaginatedResult<EmployeeDTO>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fullName',
        sortOrder = 'asc',
        filter = {},
      } = options;

      const skip = (page - 1) * limit;

      // Combina o filtro de managerId com outros filtros opcionais
      const whereCondition = {
        ...filter,
        managerId,
      };

      // Conta o total de registros para paginação
      const total = await this.prisma.employee.count({
        where: whereCondition,
      });

      const employees = await this.prisma.employee.findMany({
        skip,
        take: limit,
        where: whereCondition,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);
      
      return {
        data: employees.map(employee => this.mapToEmployeeDTO(employee)),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      log.error('Error finding employees by manager', { error: (error as Error).message, managerId });
      throw error;
    }
  }

  /**
   * Busca funcionários por departamento
   */
  public async findByDepartment(departmentId: string, options: FindAllOptions = {}): Promise<PaginatedResult<EmployeeDTO>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fullName',
        sortOrder = 'asc',
        filter = {},
      } = options;

      const skip = (page - 1) * limit;

      // Combina o filtro de departmentId com outros filtros opcionais
      const whereCondition = {
        ...filter,
        departmentId,
      };

      // Conta o total de registros para paginação
      const total = await this.prisma.employee.count({
        where: whereCondition,
      });

      const employees = await this.prisma.employee.findMany({
        skip,
        take: limit,
        where: whereCondition,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: true,
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);
      
      return {
        data: employees.map(employee => this.mapToEmployeeDTO(employee)),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      log.error('Error finding employees by department', { error: (error as Error).message, departmentId });
      throw error;
    }
  }

  /**
   * Mapeia os dados do Prisma para o DTO de funcionário
   */
  private mapToEmployeeDTO(employee: Employee & { 
    user?: any; 
    department?: any; 
    position?: any; 
    manager?: any;
  }): EmployeeDTO {
    return {
      id: employee.id,
      employeeNumber: employee.employeeNumber,
      userId: employee.userId,
      companyId: employee.companyId,
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      managerId: employee.managerId,
      
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.fullName,
      cpf: employee.cpf,
      rg: employee.rg,
      birthDate: employee.birthDate ? new Date(employee.birthDate) : null,
      gender: employee.gender,
      maritalStatus: employee.maritalStatus,
      nationality: employee.nationality,
      
      personalEmail: employee.personalEmail,
      phone: employee.phone,
      cellPhone: employee.cellPhone,
      emergencyContact: employee.emergencyContact,
      
      address: employee.address,
      city: employee.city,
      state: employee.state,
      zipCode: employee.zipCode,
      country: employee.country,
      
      hireDate: new Date(employee.hireDate),
      terminationDate: employee.terminationDate ? new Date(employee.terminationDate) : null,
      status: employee.status,
      workSchedule: employee.workSchedule,
      salary: employee.salary ? Number(employee.salary) : null,
      salaryType: employee.salaryType,
      
      profilePicture: employee.profilePicture,
      documents: employee.documents,
      
      department: employee.department ? {
        id: employee.department.id,
        name: employee.department.name,
      } : null,
      
      position: employee.position ? {
        id: employee.position.id,
        title: employee.position.title,
      } : null,
      
      manager: employee.manager ? {
        id: employee.manager.id,
        fullName: employee.manager.fullName,
      } : null,
      
      createdAt: new Date(employee.createdAt),
      updatedAt: new Date(employee.updatedAt),
    };
  }
} 