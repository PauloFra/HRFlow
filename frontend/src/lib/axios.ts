import axios from 'axios';
import { useAuthStore } from '@/hooks/use-auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
});

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get the auth store state and refreshAccessToken function
        const refreshAccessToken = useAuthStore.getState().refreshAccessToken;
        
        // Call refresh token
        const newToken = await refreshAccessToken();
        
        // Update the request header
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        // Retry the request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 