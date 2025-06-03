import { Gender, MaritalStatus, EmployeeStatus } from '@/types';

/**
 * Interface para o Data Transfer Object (DTO) de funcionário
 */
export interface EmployeeDTO {
  id: string;
  employeeNumber: string;
  userId: string;
  companyId: string;
  departmentId?: string | null;
  positionId?: string | null;
  managerId?: string | null;
  
  // Dados Pessoais
  firstName: string;
  lastName: string;
  fullName: string;
  cpf: string;
  rg?: string | null;
  birthDate?: Date | null;
  gender?: Gender | null;
  maritalStatus?: MaritalStatus | null;
  nationality?: string | null;
  
  // Contato
  personalEmail?: string | null;
  phone?: string | null;
  cellPhone?: string | null;
  emergencyContact?: any | null;
  
  // Endereço
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  
  // Dados Profissionais
  hireDate: Date;
  terminationDate?: Date | null;
  status: EmployeeStatus;
  workSchedule?: any | null;
  salary?: number | null;
  salaryType?: string | null;
  
  // Documentos e Arquivos
  profilePicture?: string | null;
  documents?: any | null;
  
  // Relacionamentos
  department?: {
    id: string;
    name: string;
  } | null;
  position?: {
    id: string;
    title: string;
  } | null;
  manager?: {
    id: string;
    fullName: string;
  } | null;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação de funcionário
 */
export interface CreateEmployeeDTO {
  userId: string;
  companyId: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  
  firstName: string;
  lastName: string;
  cpf: string;
  rg?: string;
  birthDate?: Date;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  
  personalEmail?: string;
  phone?: string;
  cellPhone?: string;
  emergencyContact?: any;
  
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  hireDate: Date;
  terminationDate?: Date;
  status?: EmployeeStatus;
  workSchedule?: any;
  salary?: number;
  salaryType?: string;
  
  profilePicture?: string;
  documents?: any;
}

/**
 * Interface para atualização de funcionário
 */
export interface UpdateEmployeeDTO {
  departmentId?: string | null;
  positionId?: string | null;
  managerId?: string | null;
  
  firstName?: string;
  lastName?: string;
  rg?: string;
  birthDate?: Date | null;
  gender?: Gender | null;
  maritalStatus?: MaritalStatus | null;
  nationality?: string | null;
  
  personalEmail?: string | null;
  phone?: string | null;
  cellPhone?: string | null;
  emergencyContact?: any | null;
  
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  
  terminationDate?: Date | null;
  status?: EmployeeStatus;
  workSchedule?: any | null;
  salary?: number | null;
  salaryType?: string | null;
  
  profilePicture?: string | null;
  documents?: any | null;
} 