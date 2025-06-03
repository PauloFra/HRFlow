import { useState, useCallback } from 'react';
import apiClient from '@/lib/axios';
import { useAuth } from '@/hooks/use-auth';

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  const request = useCallback(
    async <R = T>(
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      url: string,
      body?: any,
      headers?: Record<string, string>
    ): Promise<R> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient({
          method,
          url,
          data: body,
          headers
        });
        
        setData(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
        const error = new Error(errorMessage);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  return {
    data,
    error,
    loading,
    get: useCallback((url: string, headers?: Record<string, string>) => 
      request('GET', url, undefined, headers), [request]),
    post: useCallback((url: string, body?: any, headers?: Record<string, string>) => 
      request('POST', url, body, headers), [request]),
    put: useCallback((url: string, body?: any, headers?: Record<string, string>) => 
      request('PUT', url, body, headers), [request]),
    delete: useCallback((url: string, headers?: Record<string, string>) => 
      request('DELETE', url, undefined, headers), [request]),
  };
} 