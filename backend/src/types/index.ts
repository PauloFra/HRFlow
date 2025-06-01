/**
 * Shared TypeScript types for the HRFlow backend
 */

import { User, Employee, UserRole, UserStatus, EmployeeStatus } from '@prisma/client';

// Re-export Prisma types
export { UserRole, UserStatus, EmployeeStatus } from '@prisma/client';

// ================================
// API Response Types
// ================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ================================
// Authentication Types
// ================================

export interface JwtPayload {
  userId: string;
  employeeId?: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface LoginResponse {
  user: UserWithEmployee;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  twoFactorRequired?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// ================================
// User & Employee Types
// ================================

export interface UserWithEmployee extends User {
  employee?: Employee;
}

export interface EmployeeWithRelations extends Employee {
  user: User;
  department?: {
    id: string;
    name: string;
    code?: string;
  };
  position?: {
    id: string;
    title: string;
    level?: string;
  };
  manager?: {
    id: string;
    fullName: string;
    employeeNumber: string;
  };
}

export interface CreateEmployeeRequest {
  // User data
  email: string;
  username?: string;
  role: UserRole;
  
  // Employee data
  firstName: string;
  lastName: string;
  cpf: string;
  rg?: string;
  birthDate?: Date;
  gender?: string;
  personalEmail?: string;
  phone?: string;
  cellPhone?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Work data
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  hireDate: Date;
  salary?: number;
  salaryType?: string;
  workSchedule?: any;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  phone?: string;
  cellPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  salary?: number;
  workSchedule?: any;
  status?: EmployeeStatus;
}

// ================================
// Time Tracking Types
// ================================

export interface TimeEntryRequest {
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  locationId?: string;
  justification?: string;
}

export interface TimeEntryWithLocation {
  id: string;
  employeeId: string;
  type: string;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  status: string;
  justification?: string;
  location?: {
    id: string;
    name: string;
    address: string;
  };
  employee: {
    id: string;
    fullName: string;
    employeeNumber: string;
  };
}

export interface WorkSessionSummary {
  date: Date;
  employeeId: string;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  workedHours?: number;
  expectedHours?: number;
  overtimeHours?: number;
  breakDuration?: number;
  isComplete: boolean;
  hasIrregularity: boolean;
}

// ================================
// Leave Management Types
// ================================

export interface LeaveRequestRequest {
  leaveType: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL_LEAVE' | 'MATERNITY_LEAVE' | 'PATERNITY_LEAVE' | 'BEREAVEMENT' | 'OTHER';
  startDate: Date;
  endDate: Date;
  reason?: string;
  urgency?: string;
  attachments?: string[];
}

export interface LeaveRequestWithEmployee {
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  status: string;
  urgency?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  employee: {
    id: string;
    fullName: string;
    employeeNumber: string;
    department?: {
      name: string;
    };
  };
  attachments?: any;
}

// ================================
// Communication Types
// ================================

export interface NewsArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  category: 'GENERAL' | 'ANNOUNCEMENT' | 'EVENT' | 'POLICY' | 'TRAINING' | 'BENEFITS' | 'SAFETY';
  targetRoles: UserRole[];
  allowComments?: boolean;
  featuredImage?: string;
  attachments?: any;
  publishedAt?: Date;
  expiresAt?: Date;
  isPinned?: boolean;
}

export interface NewsArticleWithAuthor {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  status: string;
  publishedAt?: Date;
  expiresAt?: Date;
  isPinned: boolean;
  allowComments: boolean;
  targetRoles: string[];
  featuredImage?: string;
  attachments?: any;
  author: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
  commentsCount?: number;
  reactionsCount?: number;
}

// ================================
// Error Types
// ================================

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ================================
// Request Context Types
// ================================

export interface RequestContext {
  userId?: string;
  employeeId?: string;
  role?: UserRole;
  ipAddress?: string;
  userAgent?: string;
}

// ================================
// Audit Types
// ================================

export interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
}

// ================================
// Notification Types
// ================================

export interface NotificationRequest {
  userId: string;
  type: 'LEAVE_REQUEST' | 'TIME_ENTRY' | 'NEWS_ARTICLE' | 'EVENT' | 'COMMENT' | 'MENTION' | 'SYSTEM';
  title: string;
  message: string;
  metadata?: any;
  actionUrl?: string;
}

// ================================
// Export all types
// ================================

export * from '@prisma/client'; 