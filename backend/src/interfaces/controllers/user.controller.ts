import { Request, Response } from 'express';
import { log } from '@/config/logger';
import { AppError } from '@/types';
import { AuthenticatedRequest } from '@/middleware/auth';
import { 
  uploadUserPhotoUseCase,
  getUserProfileUseCase,
  updateUserProfileUseCase
} from '@/useCases/user';

/**
 * Controlador para operações com usuários
 */
export class UserController {
  /**
   * Obter próprio perfil do usuário
   */
  public async getOwnProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      
      const userProfile = await getUserProfileUseCase.execute(userId);
      
      res.status(200).json({
        success: true,
        data: userProfile,
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
   * Atualizar próprio perfil do usuário
   */
  public async updateOwnProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      const userData = req.body;
      
      const updatedProfile = await updateUserProfileUseCase.execute(userId, userData);
      
      res.status(200).json({
        success: true,
        data: updatedProfile,
        message: 'Perfil atualizado com sucesso',
      });
    } catch (error: any) {
      log.error('Error updating own profile', { error: error.message, userId: req.user?.userId });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil',
      });
    }
  }
  
  /**
   * Upload de foto de perfil própria
   */
  public async uploadOwnProfilePhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo enviado',
        });
        return;
      }
      
      const photoUrl = await uploadUserPhotoUseCase.execute(userId, req.file);
      
      res.status(200).json({
        success: true,
        data: { photoUrl },
        message: 'Foto de perfil atualizada com sucesso',
      });
    } catch (error: any) {
      log.error('Error uploading profile photo', { error: error.message, userId: req.user?.userId });
      
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
   * Excluir própria foto de perfil
   */
  public async deleteOwnProfilePhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      
      await uploadUserPhotoUseCase.deleteUserPhoto(userId);
      
      res.status(200).json({
        success: true,
        message: 'Foto de perfil excluída com sucesso',
      });
    } catch (error: any) {
      log.error('Error deleting profile photo', { error: error.message, userId: req.user?.userId });
      
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