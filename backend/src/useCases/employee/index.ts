import { EmployeeRepository } from '@/repositories/employee.repository';
import { UserRepository } from '@/repositories/user.repository';
import { CreateEmployeeUseCase } from './create-employee.usecase';
import { GetEmployeeUseCase } from './get-employee.usecase';
import { UpdateEmployeeUseCase } from './update-employee.usecase';
import { ListEmployeesUseCase } from './list-employees.usecase';
import { DeleteEmployeeUseCase } from './delete-employee.usecase';
import { UploadProfilePhotoUseCase } from './upload-profile-photo.usecase';

// Repositories
const employeeRepository = new EmployeeRepository();
const userRepository = new UserRepository();

// Use Cases
export const createEmployeeUseCase = new CreateEmployeeUseCase(employeeRepository, userRepository);
export const getEmployeeUseCase = new GetEmployeeUseCase(employeeRepository);
export const updateEmployeeUseCase = new UpdateEmployeeUseCase(employeeRepository);
export const listEmployeesUseCase = new ListEmployeesUseCase(employeeRepository);
export const deleteEmployeeUseCase = new DeleteEmployeeUseCase(employeeRepository);
export const uploadProfilePhotoUseCase = new UploadProfilePhotoUseCase(employeeRepository);

// Re-export all use cases for easy import
export { 
  CreateEmployeeUseCase,
  GetEmployeeUseCase,
  UpdateEmployeeUseCase,
  ListEmployeesUseCase,
  DeleteEmployeeUseCase,
  UploadProfilePhotoUseCase
}; 