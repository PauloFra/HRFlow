import { Request, Response } from 'express';
import { log } from '@/config/logger';
import { AppError, PaginationParams, EmployeeStatus } from '@/types';
import { AuthenticatedRequest } from '@/middleware/auth';
import { 
  createEmployeeUseCase, 
  getEmployeeUseCase, 
  updateEmployeeUseCase, 
  listEmployeesUseCase, 
  deleteEmployeeUseCase,
  uploadProfilePhotoUseCase
} from '@/useCases/employee';
import { CreateEmployeeDTO, UpdateEmployeeDTO } from '@/types/dto/employee.dto';

/**
 * Controlador para operações com funcionários
 */
export class EmployeeController {
  /**
   * Obter próprio perfil do funcionário
   */
  public async getOwnProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      
      const employee = await getEmployeeUseCase.getByUserId(userId);
      
      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error: any) {
      log.error('Error getting own profile', { error: error.message, userId: req.user?.userId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil',
      });
    }
  }

  /**
   * Obter todos os funcionários
   * RBAC: Admin, HR
   */
  public async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'fullName', 
        sortOrder = 'asc',
        search = '',
        department,
        status,
      } = req.query as any;
      
      // Constrói filtro baseado nos parâmetros de busca
      const filter: any = {};
      
      if (search) {
        filter.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { employeeNumber: { contains: search } },
          { cpf: { contains: search } },
        ];
      }
      
      if (department) {
        filter.departmentId = department;
      }
      
      if (status) {
        filter.status = status;
      }
      
      const result = await listEmployeesUseCase.execute({
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder,
        filter,
      });
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error: any) {
      log.error('Error getting all employees', { error: error.message });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao listar funcionários',
      });
    }
  }

  /**
   * Criar novo funcionário
   * RBAC: Admin, HR
   */
  public async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const employeeData: CreateEmployeeDTO = req.body;
      
      const newEmployee = await createEmployeeUseCase.execute(employeeData);
      
      res.status(201).json({
        success: true,
        data: newEmployee,
        message: 'Funcionário criado com sucesso',
      });
    } catch (error: any) {
      log.error('Error creating employee', { error: error.message });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao criar funcionário',
      });
    }
  }

  /**
   * Obter funcionário por ID
   * RBAC: Admin, HR, Owner, Manager
   */
  public async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      
      const employee = await getEmployeeUseCase.getById(employeeId);
      
      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error: any) {
      log.error('Error getting employee by ID', { error: error.message, employeeId: req.params.employeeId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar funcionário',
      });
    }
  }

  /**
   * Atualizar funcionário
   * RBAC: Admin, HR, Owner (parcial)
   */
  public async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const employeeData: UpdateEmployeeDTO = req.body;
      
      const updatedEmployee = await updateEmployeeUseCase.execute(employeeId, employeeData);
      
      res.status(200).json({
        success: true,
        data: updatedEmployee,
        message: 'Funcionário atualizado com sucesso',
      });
    } catch (error: any) {
      log.error('Error updating employee', { error: error.message, employeeId: req.params.employeeId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar funcionário',
      });
    }
  }

  /**
   * Obter subordinados de um gerente
   * RBAC: Admin, HR, Manager
   */
  public async getSubordinates(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'fullName', 
        sortOrder = 'asc',
      } = req.query as any;
      
      const result = await listEmployeesUseCase.getByManager(employeeId, {
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder,
      });
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error: any) {
      log.error('Error getting subordinates', { error: error.message, employeeId: req.params.employeeId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar subordinados',
      });
    }
  }

  /**
   * Excluir funcionário
   * RBAC: Admin, HR
   */
  public async deleteEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      
      await deleteEmployeeUseCase.execute(employeeId);
      
      res.status(200).json({
        success: true,
        message: 'Funcionário excluído com sucesso',
      });
    } catch (error: any) {
      log.error('Error deleting employee', { error: error.message, employeeId: req.params.employeeId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir funcionário',
      });
    }
  }

  /**
   * Alterar status do funcionário
   * RBAC: Admin, HR
   */
  public async changeEmployeeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const { status } = req.body;
      
      const updatedEmployee = await updateEmployeeUseCase.updateStatus(employeeId, status);
      
      res.status(200).json({
        success: true,
        data: updatedEmployee,
        message: 'Status do funcionário atualizado com sucesso',
      });
    } catch (error: any) {
      log.error('Error changing employee status', { error: error.message, employeeId: req.params.employeeId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao alterar status do funcionário',
      });
    }
  }

  /**
   * Obter todos os departamentos
   * RBAC: Admin, HR, Manager
   */
  public async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      // Implementação futura: listar todos os departamentos
      res.status(200).json({
        success: true,
        data: [],
        message: 'Feature em desenvolvimento',
      });
    } catch (error: any) {
      log.error('Error getting all departments', { error: error.message });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao listar departamentos',
      });
    }
  }

  /**
   * Obter todos os cargos
   * RBAC: Admin, HR, Manager
   */
  public async getAllPositions(req: Request, res: Response): Promise<void> {
    try {
      // Implementação futura: listar todos os cargos
      res.status(200).json({
        success: true,
        data: [],
        message: 'Feature em desenvolvimento',
      });
    } catch (error: any) {
      log.error('Error getting all positions', { error: error.message });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao listar cargos',
      });
    }
  }

  /**
   * Upload de foto de perfil
   * RBAC: Admin, HR, Owner
   */
  public async uploadProfilePhoto(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo enviado',
        });
        return;
      }
      
      const photoUrl = await uploadProfilePhotoUseCase.execute(employeeId, req.file);
      
      res.status(200).json({
        success: true,
        data: { photoUrl },
        message: 'Foto de perfil atualizada com sucesso',
      });
    } catch (error: any) {
      log.error('Error uploading profile photo', { error: error.message, employeeId: req.params.employeeId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload da foto de perfil',
      });
    }
  }

  /**
   * Excluir foto de perfil
   * RBAC: Admin, HR, Owner
   */
  public async deleteProfilePhoto(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      
      await uploadProfilePhotoUseCase.deleteProfilePhoto(employeeId);
      
      res.status(200).json({
        success: true,
        message: 'Foto de perfil excluída com sucesso',
      });
    } catch (error: any) {
      log.error('Error deleting profile photo', { error: error.message, employeeId: req.params.employeeId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir foto de perfil',
      });
    }
  }
} 