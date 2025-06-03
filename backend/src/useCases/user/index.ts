import { UserRepository } from '@/repositories/user.repository';
import { UploadUserPhotoUseCase } from './upload-user-photo.usecase';
import { GetUserProfileUseCase } from './get-user-profile.usecase';
import { UpdateUserProfileUseCase } from './update-user-profile.usecase';

// Repositories
const userRepository = new UserRepository();

// Use Cases
export const uploadUserPhotoUseCase = new UploadUserPhotoUseCase(userRepository);
export const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
export const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);

// Re-export all use cases for easy import
export {
  UploadUserPhotoUseCase,
  GetUserProfileUseCase,
  UpdateUserProfileUseCase
}; 