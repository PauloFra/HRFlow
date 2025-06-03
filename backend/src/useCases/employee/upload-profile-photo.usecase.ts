import { EmployeeRepository } from '@/repositories/employee.repository';
import { fileStorageService } from '@/domains/services/file-storage.service';
import { AppError } from '@/types';
import { log } from '@/config/logger';

/**
 * Caso de uso para upload e gerenciamento de fotos de perfil
 */
export class UploadProfilePhotoUseCase {
  constructor(
    private employeeRepository: EmployeeRepository
  ) {}

  /**
   * Faz upload e atualiza a foto de perfil do funcionário
   */
  public async execute(employeeId: string, file: Express.Multer.File): Promise<string> {
    try {
      // Verifica se o funcionário existe
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      // Verifica se o arquivo é uma imagem válida
      this.validateImageFile(file);

      // Se já existir uma foto de perfil, excluir a anterior
      if (employee.profilePicture) {
        try {
          await fileStorageService.deleteFile(employee.profilePicture, 'profiles');
        } catch (error) {
          // Apenas loga o erro, mas continua o processo
          log.warn('Failed to delete previous profile photo', { 
            error: (error as Error).message, 
            employeeId,
            photoUrl: employee.profilePicture
          });
        }
      }

      // Faz upload da nova foto
      const photoUrl = await fileStorageService.uploadFile(file, 'profiles');

      // Atualiza o perfil do funcionário com a nova URL da foto
      await this.employeeRepository.update(employeeId, { profilePicture: photoUrl });

      log.info('Profile photo updated successfully', { employeeId, photoUrl });
      return photoUrl;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error uploading profile photo', { error: (error as Error).message, employeeId });
      throw new AppError('Erro ao fazer upload da foto de perfil', 500);
    }
  }

  /**
   * Exclui a foto de perfil do funcionário
   */
  public async deleteProfilePhoto(employeeId: string): Promise<void> {
    try {
      // Verifica se o funcionário existe
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      // Verifica se o funcionário tem uma foto de perfil
      if (!employee.profilePicture) {
        throw new AppError('Funcionário não possui foto de perfil', 400);
      }

      // Exclui a foto de perfil do armazenamento
      await fileStorageService.deleteFile(employee.profilePicture, 'profiles');

      // Atualiza o perfil do funcionário removendo a URL da foto
      await this.employeeRepository.update(employeeId, { profilePicture: null });

      log.info('Profile photo deleted successfully', { employeeId });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error deleting profile photo', { error: (error as Error).message, employeeId });
      throw new AppError('Erro ao excluir foto de perfil', 500);
    }
  }

  /**
   * Valida se o arquivo é uma imagem permitida
   */
  private validateImageFile(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError('Tipo de arquivo não permitido. Envie uma imagem JPEG, PNG, GIF ou WEBP.', 400);
    }
    
    if (file.size > maxSizeInBytes) {
      throw new AppError('Tamanho do arquivo excede o limite máximo de 5MB.', 400);
    }
  }
} 