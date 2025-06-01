/**
 * Base repository interface for Clean Architecture
 */

export interface BaseRepository<T, K = string> {
  findById(id: K): Promise<T | null>;
  findAll(options?: FindAllOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: K, data: Partial<T>): Promise<T | null>;
  delete(id: K): Promise<boolean>;
  count(filter?: any): Promise<number>;
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: any;
  include?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 