import { Client } from 'minio';
import { createReadStream } from 'fs';
import { log } from '@/config/logger';
import { AppError } from '@/types';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for handling file storage operations with MinIO
 */
export class FileStorageService {
  private minioClient: Client;
  private buckets = {
    profiles: process.env.MINIO_PROFILE_BUCKET || 'profiles',
    documents: process.env.MINIO_DOCUMENTS_BUCKET || 'documents',
    attachments: process.env.MINIO_ATTACHMENTS_BUCKET || 'attachments'
  };

  constructor() {
    // Initialize MinIO client
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });

    // Ensure buckets exist on startup
    this.initializeBuckets().catch(error => {
      log.error('Failed to initialize MinIO buckets', { error: (error as Error).message });
    });
  }

  /**
   * Initialize required buckets if they don't exist
   */
  private async initializeBuckets(): Promise<void> {
    for (const [key, bucketName] of Object.entries(this.buckets)) {
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, process.env.MINIO_REGION || 'us-east-1');
        log.info(`Created MinIO bucket: ${bucketName}`);
        
        // Set public read policy for profile images bucket
        if (key === 'profiles') {
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucketName}/*`]
              }
            ]
          };
          
          await this.minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
          log.info(`Set public read policy for bucket: ${bucketName}`);
        }
      }
    }
  }

  /**
   * Upload a file to the specified bucket
   */
  public async uploadFile(
    file: Express.Multer.File,
    bucketType: 'profiles' | 'documents' | 'attachments',
    customFilename?: string
  ): Promise<string> {
    try {
      const bucketName = this.buckets[bucketType];
      const fileExtension = extname(file.originalname).toLowerCase();
      
      // Generate a unique filename if not provided
      const filename = customFilename || `${uuidv4()}${fileExtension}`;
      
      // Set appropriate content type
      const contentType = file.mimetype;
      
      // Upload file to MinIO
      await this.minioClient.putObject(
        bucketName,
        filename,
        createReadStream(file.path),
        file.size,
        { 'Content-Type': contentType }
      );
      
      // Construct and return the file URL
      const fileUrl = this.getFileUrl(bucketName, filename);
      
      log.info('File uploaded successfully', { bucket: bucketName, filename });
      return fileUrl;
    } catch (error) {
      log.error('Error uploading file to MinIO', { 
        error: (error as Error).message, 
        bucketType, 
        originalName: file.originalname 
      });
      throw new AppError('Error uploading file', 500);
    }
  }

  /**
   * Delete a file from the specified bucket
   */
  public async deleteFile(
    fileUrl: string,
    bucketType: 'profiles' | 'documents' | 'attachments'
  ): Promise<void> {
    try {
      const bucketName = this.buckets[bucketType];
      
      // Extract filename from URL
      const filename = this.getFilenameFromUrl(fileUrl);
      
      if (!filename) {
        throw new AppError('Invalid file URL', 400);
      }
      
      // Check if object exists
      await this.minioClient.statObject(bucketName, filename);
      
      // Delete file from MinIO
      await this.minioClient.removeObject(bucketName, filename);
      
      log.info('File deleted successfully', { bucket: bucketName, filename });
    } catch (error) {
      log.error('Error deleting file from MinIO', { 
        error: (error as Error).message, 
        bucketType, 
        fileUrl 
      });
      throw new AppError('Error deleting file', 500);
    }
  }

  /**
   * Generate a pre-signed URL for file download
   */
  public async getPresignedUrl(
    fileUrl: string,
    bucketType: 'profiles' | 'documents' | 'attachments',
    expiryInSeconds: number = 3600
  ): Promise<string> {
    try {
      const bucketName = this.buckets[bucketType];
      
      // Extract filename from URL
      const filename = this.getFilenameFromUrl(fileUrl);
      
      if (!filename) {
        throw new AppError('Invalid file URL', 400);
      }
      
      // Generate pre-signed URL
      const presignedUrl = await this.minioClient.presignedGetObject(
        bucketName,
        filename,
        expiryInSeconds
      );
      
      return presignedUrl;
    } catch (error) {
      log.error('Error generating pre-signed URL', { 
        error: (error as Error).message, 
        bucketType, 
        fileUrl 
      });
      throw new AppError('Error generating download URL', 500);
    }
  }

  /**
   * Get public URL for a file
   */
  private getFileUrl(bucketName: string, filename: string): string {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    
    const protocol = useSSL ? 'https' : 'http';
    
    return `${protocol}://${endpoint}:${port}/${bucketName}/${filename}`;
  }

  /**
   * Extract filename from URL
   */
  private getFilenameFromUrl(url: string): string | null {
    const matches = url.match(/\/([^\/]+)$/);
    return matches ? matches[1] : null;
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService(); 