/**
 * Employee entity for domain layer
 */

import { Gender, MaritalStatus, EmployeeStatus } from '@/types';

export class Employee {
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
  
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Employee>) {
    this.id = data.id || '';
    this.employeeNumber = data.employeeNumber || '';
    this.userId = data.userId || '';
    this.companyId = data.companyId || '';
    this.departmentId = data.departmentId;
    this.positionId = data.positionId;
    this.managerId = data.managerId;
    
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.fullName = data.fullName || `${this.firstName} ${this.lastName}`;
    this.cpf = data.cpf || '';
    this.rg = data.rg;
    this.birthDate = data.birthDate;
    this.gender = data.gender;
    this.maritalStatus = data.maritalStatus;
    this.nationality = data.nationality;
    
    this.personalEmail = data.personalEmail;
    this.phone = data.phone;
    this.cellPhone = data.cellPhone;
    this.emergencyContact = data.emergencyContact;
    
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.zipCode = data.zipCode;
    this.country = data.country;
    
    this.hireDate = data.hireDate || new Date();
    this.terminationDate = data.terminationDate;
    this.status = data.status || EmployeeStatus.ACTIVE;
    this.workSchedule = data.workSchedule;
    this.salary = data.salary;
    this.salaryType = data.salaryType;
    
    this.profilePicture = data.profilePicture;
    this.documents = data.documents;
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Calcula a idade do funcionário
   */
  public getAge(): number | null {
    if (!this.birthDate) return null;
    
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Verifica se o funcionário está ativo
   */
  public isActive(): boolean {
    return this.status === EmployeeStatus.ACTIVE;
  }

  /**
   * Calcula o tempo de empresa em anos
   */
  public getTenureYears(): number {
    const today = new Date();
    const hireDate = new Date(this.hireDate);
    let years = today.getFullYear() - hireDate.getFullYear();
    const monthDiff = today.getMonth() - hireDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDate.getDate())) {
      years--;
    }
    
    return years;
  }

  /**
   * Atualiza o status do funcionário
   */
  public updateStatus(status: EmployeeStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * Registra término do vínculo
   */
  public terminate(terminationDate: Date): void {
    this.status = EmployeeStatus.TERMINATED;
    this.terminationDate = terminationDate;
    this.updatedAt = new Date();
  }
} 