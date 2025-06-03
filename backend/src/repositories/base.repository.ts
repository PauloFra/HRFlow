/**
 * Base repository interface for Clean Architecture
 */

export interface IBaseRepository<T, K = string> {
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

/**
 * Classe base para repositórios
 */
export abstract class BaseRepository {
  /**
   * Método para formatar datas para o Prisma
   */
  protected formatDate(date: Date | string | null): Date | null {
    if (!date) return null;
    return typeof date === 'string' ? new Date(date) : date;
  }

  /**
   * Método para normalizar booleanos
   */
  protected normalizeBoolean(value: boolean | string | number | null | undefined): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    if (typeof value === 'number') return value !== 0;
    return false;
  }

  /**
   * Método para converter valor para número
   */
  protected toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
} 