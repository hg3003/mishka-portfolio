import axios, { type AxiosError } from 'axios';

// Determine if running in Electron
const isElectron = () => {
  // Guard for non-browser contexts
  if (typeof navigator === 'undefined' || !navigator.userAgent) return false;
  return navigator.userAgent.toLowerCase().includes('electron');
};

const normalizeBase = (base: string) => base.replace(/\/+$/, '');

// Dynamically determine API URL based on environment
const getApiUrl = () => {
  // Use environment variable if explicitly set
  if (import.meta.env.VITE_API_URL) {
    return normalizeBase(String(import.meta.env.VITE_API_URL));
  }

  // In production or Electron, use local backend
  if (import.meta.env.PROD || isElectron()) {
    return 'http://127.0.0.1:3001';
  }

  // In development, use localhost
  return 'http://localhost:3001';
};

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Store token in memory for Electron (more secure than localStorage)
let authToken: string | null = null;

// Token management functions
export const auth = {
  setToken: (token: string | null) => {
    authToken = token;
    // Only use localStorage in browser, not Electron
    if (!isElectron() && token) {
      localStorage.setItem('token', token);
    }
  },
  
  getToken: (): string | null => {
    if (authToken) return authToken;
    // Only check localStorage in browser
    if (!isElectron()) {
      authToken = localStorage.getItem('token');
    }
    return authToken;
  },
  
  clearToken: () => {
    authToken = null;
    if (!isElectron()) {
      localStorage.removeItem('token');
    }
  }
};

// Request interceptor for auth (if needed later)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      auth.clearToken();
      // In Electron, we might handle this differently
      if (!isElectron()) {
        window.location.href = '/login';
      }
      // You might want to emit an event or use a global state manager
      // to handle auth errors in Electron
    }
    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error handling helper
export function getErrorMessage(error: any): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'An error occurred';
  }
  return error?.message || 'An unexpected error occurred';
}

// Helper function to construct full URLs for assets
export function getAssetUrl(path: string): string {
  if (!path) return '';

  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const baseUrl = getApiUrl(); // normalized (no trailing slash)
  // Normalize path:
  // - if it already starts with "/uploads", use as-is
  // - if it starts with "/", join directly
  // - otherwise, treat as relative under "/uploads"
  let normalizedPath: string;
  if (path.startsWith('/uploads')) {
    normalizedPath = path;
  } else if (path.startsWith('/')) {
    normalizedPath = path;
  } else if (path.startsWith('uploads/')) {
    normalizedPath = `/${path}`;
  } else {
    normalizedPath = `/uploads/${path}`;
  }

  return `${baseUrl}${normalizedPath}`;
}

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    baseURL: getApiUrl(),
    isElectron: isElectron(),
    environment: import.meta.env.MODE,
  });
}

// Export the base URL for other uses
export const API_URL = getApiUrl();

export type { };
