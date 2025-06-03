import { UploadUserPhotoUseCase } from '@/useCases/user/upload-user-photo.usecase';
import { UserRepository } from '@/repositories/user.repository';
import { fileStorageService } from '@/domains/services/file-storage.service';
import { AppError } from '@/types';

// Mock das dependências
jest.mock('@/repositories/user.repository');
jest.mock('@/domains/services/file-storage.service');
jest.mock('@/config/logger');

describe('UploadUserPhotoUseCase', () => {
  let uploadUserPhotoUseCase: UploadUserPhotoUseCase;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    // Resetar os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Criar instâncias dos mocks
    userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>;
    
    // Instanciar o caso de uso com os mocks
    uploadUserPhotoUseCase = new UploadUserPhotoUseCase(userRepositoryMock);
  });
  
  describe('execute', () => {
    it('should upload user photo successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      const photoUrl = 'https://example.com/test-photo.jpg';
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        avatarUrl: null,
      };
      
      const mockFile = {
        originalname: 'test-photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        path: '/tmp/test-photo.jpg',
      } as Express.Multer.File;
      
      // Mock do repositório retornando um usuário válido
      userRepositoryMock.findById = jest.fn().mockResolvedValue(mockUser);
      userRepositoryMock.update = jest.fn().mockResolvedValue({ ...mockUser, avatarUrl: photoUrl });
      
      // Mock do serviço de armazenamento retornando uma URL
      (fileStorageService.uploadFile as jest.Mock).mockResolvedValue(photoUrl);
      
      // Act
      const result = await uploadUserPhotoUseCase.execute(userId, mockFile);
      
      // Assert
      expect(result).toBe(photoUrl);
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(userId);
      expect(fileStorageService.uploadFile).toHaveBeenCalledWith(mockFile, 'profiles');
      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, { avatarUrl: photoUrl });
    });
    
    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      
      const mockFile = {
        originalname: 'test-photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        path: '/tmp/test-photo.jpg',
      } as Express.Multer.File;
      
      // Mock do repositório retornando null (usuário não encontrado)
      userRepositoryMock.findById = jest.fn().mockResolvedValue(null);
      
      // Act & Assert
      await expect(uploadUserPhotoUseCase.execute(userId, mockFile))
        .rejects
        .toThrow(new AppError('Usuário não encontrado', 404));
      
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(userId);
      expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
    
    it('should throw error if file type is not supported', async () => {
      // Arrange
      const userId = 'test-user-id';
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        avatarUrl: null,
      };
      
      const mockFile = {
        originalname: 'test-document.pdf',
        mimetype: 'application/pdf', // Tipo não suportado para fotos
        size: 1024 * 1024, // 1MB
        path: '/tmp/test-document.pdf',
      } as Express.Multer.File;
      
      // Mock do repositório retornando um usuário válido
      userRepositoryMock.findById = jest.fn().mockResolvedValue(mockUser);
      
      // Act & Assert
      await expect(uploadUserPhotoUseCase.execute(userId, mockFile))
        .rejects
        .toThrow(new AppError('Tipo de arquivo não permitido. Envie uma imagem JPEG, PNG, GIF ou WEBP.', 400));
      
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(userId);
      expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
    
    it('should throw error if file size exceeds limit', async () => {
      // Arrange
      const userId = 'test-user-id';
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        avatarUrl: null,
      };
      
      const mockFile = {
        originalname: 'test-photo.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB (acima do limite de 5MB)
        path: '/tmp/test-photo.jpg',
      } as Express.Multer.File;
      
      // Mock do repositório retornando um usuário válido
      userRepositoryMock.findById = jest.fn().mockResolvedValue(mockUser);
      
      // Act & Assert
      await expect(uploadUserPhotoUseCase.execute(userId, mockFile))
        .rejects
        .toThrow(new AppError('Tamanho do arquivo excede o limite máximo de 5MB.', 400));
      
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(userId);
      expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
    
    it('should delete previous photo if user already has one', async () => {
      // Arrange
      const userId = 'test-user-id';
      const oldPhotoUrl = 'https://example.com/old-photo.jpg';
      const newPhotoUrl = 'https://example.com/new-photo.jpg';
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        avatarUrl: oldPhotoUrl,
      };
      
      const mockFile = {
        originalname: 'test-photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        path: '/tmp/test-photo.jpg',
      } as Express.Multer.File;
      
      // Mock do repositório retornando um usuário válido com foto existente
      userRepositoryMock.findById = jest.fn().mockResolvedValue(mockUser);
      userRepositoryMock.update = jest.fn().mockResolvedValue({ ...mockUser, avatarUrl: newPhotoUrl });
      
      // Mock do serviço de armazenamento
      (fileStorageService.deleteFile as jest.Mock).mockResolvedValue(undefined);
      (fileStorageService.uploadFile as jest.Mock).mockResolvedValue(newPhotoUrl);
      
      // Act
      const result = await uploadUserPhotoUseCase.execute(userId, mockFile);
      
      // Assert
      expect(result).toBe(newPhotoUrl);
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(userId);
      expect(fileStorageService.deleteFile).toHaveBeenCalledWith(oldPhotoUrl, 'profiles');
      expect(fileStorageService.uploadFile).toHaveBeenCalledWith(mockFile, 'profiles');
      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, { avatarUrl: newPhotoUrl });
    });
  });
  
  describe('deleteUserPhoto', () => {
    it('should delete user photo successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      const photoUrl = 'https://example.com/test-photo.jpg';
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        avatarUrl: photoUrl,
      };
      
      // Mock do repositório
      userRepositoryMock.findById = jest.fn().mockResolvedValue(mockUser);
      userRepositoryMock.update = jest.fn().mockResolvedValue({ ...mockUser, avatarUrl: null });
      
      // Mock do serviço de armazenamento
      (fileStorageService.deleteFile as jest.Mock).mockResolvedValue(undefined);
      
      // Act
      await uploadUserPhotoUseCase.deleteUserPhoto(userId);
      
      // Assert
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(userId);
      expect(fileStorageService.deleteFile).toHaveBeenCalledWith(photoUrl, 'profiles');
      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, { avatarUrl: null });
    });
    
    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      
      // Mock do repositório retornando null (usuário não encontrado)
      userRepositoryMock.findById = jest.fn().mockResolvedValue(null);
      
      // Act & Assert
      await expect(uploadUserPhotoUseCase.deleteUserPhoto(userId))
        .rejects
        .toThrow(new AppError('Usuário não encontrado', 404));
      
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(userId);
      expect(fileStorageService.deleteFile).not.toHaveBeenCalled();
      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
    
    it('should throw error if user has no photo', async () => {
      // Arrange
      const userId = 'test-user-id';
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        avatarUrl: null, // Sem foto de perfil
      };
      
      // Mock do repositório
      userRepositoryMock.findById = jest.fn().mockResolvedValue(mockUser);
      
      // Act & Assert
      await expect(uploadUserPhotoUseCase.deleteUserPhoto(userId))
        .rejects
        .toThrow(new AppError('Usuário não possui foto de perfil', 400));
      
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(userId);
      expect(fileStorageService.deleteFile).not.toHaveBeenCalled();
      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
  });
}); 