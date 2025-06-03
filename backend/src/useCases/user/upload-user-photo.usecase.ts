import { UserRepository } from '@/repositories/user.repository';
import { fileStorageService } from '@/domains/services/file-storage.service';
import { AppError } from '@/types';
import { log } from '@/config/logger';

/**
 * Caso de uso para upload e gerenciamento de fotos de perfil de usuário
 */
export class UploadUserPhotoUseCase {
  constructor(
    private userRepository: UserRepository
  ) {}

  /**
   * Faz upload e atualiza a foto de perfil do usuário
   */
  public async execute(userId: string, file: Express.Multer.File): Promise<string> {
    try {
      // Verifica se o usuário existe
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Verifica se o arquivo é uma imagem válida
      this.validateImageFile(file);

      // Se já existir uma foto de perfil, excluir a anterior
      if (user.avatarUrl) {
        try {
          await fileStorageService.deleteFile(user.avatarUrl, 'profiles');
        } catch (error) {
          // Apenas loga o erro, mas continua o processo
          log.warn('Failed to delete previous user profile photo', { 
            error: (error as Error).message, 
            userId,
            photoUrl: user.avatarUrl
          });
        }
      }

      // Faz upload da nova foto
      const photoUrl = await fileStorageService.uploadFile(file, 'profiles');

      // Atualiza o perfil do usuário com a nova URL da foto
      await this.userRepository.update(userId, { avatarUrl: photoUrl });

      log.info('User profile photo updated successfully', { userId, photoUrl });
      return photoUrl;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error uploading user profile photo', { error: (error as Error).message, userId });
      throw new AppError('Erro ao fazer upload da foto de perfil', 500);
    }
  }

  /**
   * Exclui a foto de perfil do usuário
   */
  public async deleteUserPhoto(userId: string): Promise<void> {
    try {
      // Verifica se o usuário existe
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Verifica se o usuário tem uma foto de perfil
      if (!user.avatarUrl) {
        throw new AppError('Usuário não possui foto de perfil', 400);
      }

      // Exclui a foto de perfil do armazenamento
      await fileStorageService.deleteFile(user.avatarUrl, 'profiles');

      // Atualiza o perfil do usuário removendo a URL da foto
      await this.userRepository.update(userId, { avatarUrl: null });

      log.info('User profile photo deleted successfully', { userId });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      log.error('Error deleting user profile photo', { error: (error as Error).message, userId });
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