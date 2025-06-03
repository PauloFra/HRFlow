import multer from 'multer';
import { Request } from 'express';
import { randomBytes } from 'crypto';
import path from 'path';
import fs from 'fs';
import { AppError } from '@/types';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Temporary storage configuration for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate random filename to prevent filename collisions
    const random = randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    const filename = `${Date.now()}-${random}${extension}`;
    cb(null, filename);
  }
});

// Validate file type helper
const fileTypeFilter = (allowedTypes: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`, 400));
    }
  };
};

// File upload middleware configurations
export const upload = {
  // Profile photo upload (5MB limit, images only)
  profilePhoto: multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileTypeFilter(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
  }).single('profilePhoto'),

  // Document upload (10MB limit, PDF, DOC, DOCX only)
  document: multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: fileTypeFilter(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
  }).single('document'),

  // General attachment upload (20MB limit, various file types)
  attachment: multer({
    storage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
    fileFilter: fileTypeFilter([
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv'
    ])
  }).single('attachment'),

  // Multiple attachments upload (20MB total limit, various file types)
  attachments: multer({
    storage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
    fileFilter: fileTypeFilter([
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv'
    ])
  }).array('attachments', 10) // Maximum 10 files
};

// Clean up temporary files middleware
export const cleanUploadedFiles = (req: Request, res: Response, next: Function) => {
  const files = req.file ? [req.file] : req.files || [];
  
  res.on('finish', () => {
    // Only delete files if response was successful
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (Array.isArray(files)) {
        files.forEach(file => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
    }
  });
  
  next();
}; 