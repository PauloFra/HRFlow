'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
}

// Create the auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          // Call the API to login
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await axios.post(`${apiUrl}/auth/login`, {
            email,
            password,
          });

          const { user, accessToken, refreshToken, requiresTwoFactor } = response.data;

          // If 2FA is required, we should handle it differently
          if (requiresTwoFactor) {
            // TODO: Implement 2FA flow
            throw new Error('2FA authentication is required but not implemented yet');
          }

          // Decode the token to get user info
          if (accessToken) {
            try {
              const decodedToken = jwtDecode<{ userId: string; email: string; role: string }>(
                accessToken
              );
              
              // Set the auth state
              set({
                user: {
                  id: user.id || decodedToken.userId,
                  email: user.email || decodedToken.email,
                  name: user.name || user.username || decodedToken.email.split('@')[0],
                  role: user.role || decodedToken.role,
                },
                accessToken,
                refreshToken,
                isAuthenticated: true,
              });
              
              // Configure axios to use the token
              axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            } catch (error) {
              console.error('Error decoding token:', error);
              throw new Error('Invalid token format');
            }
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          
          // Call the API to logout
          if (refreshToken) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            try {
              await axios.post(`${apiUrl}/auth/logout`, {
                refreshToken,
              });
            } catch (error) {
              console.error('API logout error:', error);
              // Continue com o logout local mesmo se a API falhar
            }
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear auth state regardless of API call success
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          
          // Remove Authorization header
          delete axios.defaults.headers.common['Authorization'];
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken: newAccessToken } = response.data;

          set({ accessToken: newAccessToken });
          axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          
          return newAccessToken;
        } catch (error) {
          console.error('Token refresh error:', error);
          
          // If refresh fails, logout
          await get().logout();
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Custom hook to use the auth store
export function useAuth() {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    refreshAccessToken,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
    refreshAccessToken,
  };
} 