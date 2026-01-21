import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { supabase } from './supabase';

/**
 * Protected Axios Client
 * 
 * This client automatically attaches the JWT token from Supabase to all requests.
 * It handles token refresh on 401 errors and provides a secure way to make authenticated API calls.
 */

// Create protected axios instance with default config
const protectedAxiosClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - automatically attach JWT token from Supabase
 * This runs before every request to ensure the token is always up-to-date
 */
protectedAxiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get the current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Failed to get session for axios request:', error);
        return config;
      }

      // Attach JWT token (access_token) to Authorization header
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        // If no session, you might want to handle this differently
        // For now, we'll just log a warning
        console.warn('No active session found. Request will be made without authentication.');
      }
    } catch (error) {
      // If getting session fails, continue without auth token
      console.error('Error getting session for axios request:', error);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors and token refresh
 * Automatically refreshes the token if a 401 error is received
 */
protectedAxiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session/token
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && session?.access_token) {
          // Update the authorization header with the new token
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          
          // Retry the original request with the new token
          return protectedAxiosClient(originalRequest);
        } else {
          // If refresh fails, the session is invalid
          console.error('Failed to refresh session:', refreshError);
          // You might want to redirect to login here or clear the session
          await supabase.auth.signOut();
        }
      } catch (refreshError) {
        // If refresh fails completely, sign out the user
        console.error('Error refreshing session:', refreshError);
        await supabase.auth.signOut();
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response received', {
        url: error.config?.url,
      });
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to get the current JWT token
 * Useful if you need to manually attach the token elsewhere
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Protected Axios Client
 * Use this client for all authenticated API requests.
 * The JWT token from Supabase will be automatically attached to all requests.
 * 
 * @example
 * ```typescript
 * import protectedAxiosClient from '@/lib/axios';
 * 
 * const response = await protectedAxiosClient.get('/api/protected-endpoint');
 * const data = await protectedAxiosClient.post('/api/data', { name: 'John' });
 * ```
 */
export default protectedAxiosClient;
