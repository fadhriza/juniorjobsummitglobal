import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { auth } from './firebase';
import { Product, CreateProductData, UpdateProductData, ApiResponse } from '../types';
import toast from 'react-hot-toast';

// Create axios instance for internal API calls
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true); // Force refresh
        config.headers.Authorization = token;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
      // Continue without token - let the API handle unauthorized requests
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common HTTP errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      switch (status) {
        case 401:
          toast.error('Session expired. Please sign in again.');
          // Optionally redirect to login
          break;
        case 403:
          toast.error('Access denied. You do not have permission.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          if (data?.message) {
            toast.error(data.message);
          } else {
            toast.error('An unexpected error occurred.');
          }
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your internet connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API Service class with comprehensive error handling
export class ApiService {
  // Get products with pagination and search
  static async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<Product[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search && params.search.trim()) {
        queryParams.append('search', params.search.trim());
      }

      const url = `/products${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      
      return response.data;
    } catch (error: any) {
      console.error('Get products error:', error);
      
      // Return a fallback response for better UX
      return {
        status_code: '500',
        is_success: false,
        error_code: 'FETCH_PRODUCTS_ERROR',
        data: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          total_pages: 0,
          search: params?.search || null,
        }
      };
    }
  }

  // Get single product by ID
  static async getProduct(productId: string): Promise<ApiResponse<Product | null>> {
    try {
      if (!productId || !productId.trim()) {
        throw new Error('Product ID is required');
      }

      const response = await apiClient.get(`/product?productId=${encodeURIComponent(productId)}`);
      return response.data;
    } catch (error: any) {
      console.error('Get product error:', error);
      
      return {
        status_code: '500',
        is_success: false,
        error_code: 'FETCH_PRODUCT_ERROR',
        data: null,
      };
    }
  }

  // Create new product
  static async createProduct(productData: CreateProductData): Promise<ApiResponse<Product | null>> {
    try {
      // Client-side validation
      const validationError = this.validateProductData(productData);
      if (validationError) {
        throw new Error(validationError);
      }

      // Clean the data
      const cleanData = this.cleanProductData(productData);
      
      const response = await apiClient.post('/product', cleanData);
      return response.data;
    } catch (error: any) {
      console.error('Create product error:', error);
      
      // Re-throw validation errors
      if (error.message && !error.response) {
        throw error;
      }
      
      return {
        status_code: '500',
        is_success: false,
        error_code: 'CREATE_PRODUCT_ERROR',
        data: null,
      };
    }
  }

  // Update existing product
  static async updateProduct(productId: string, productData: UpdateProductData): Promise<ApiResponse<Product | null>> {
    try {
      if (!productId || !productId.trim()) {
        throw new Error('Product ID is required');
      }

      // Client-side validation for update data
      if (productData.product_price !== undefined) {
        if (typeof productData.product_price !== 'number' || productData.product_price < 0) {
          throw new Error('Price must be a positive number');
        }
      }

      if (productData.product_title !== undefined) {
        if (!productData.product_title || !productData.product_title.trim()) {
          throw new Error('Product title cannot be empty');
        }
      }

      // Clean the data
      const cleanData = this.cleanProductData(productData);
      
      const response = await apiClient.put('/product', {
        product_id: productId,
        ...cleanData
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Update product error:', error);
      
      // Re-throw validation errors
      if (error.message && !error.response) {
        throw error;
      }
      
      return {
        status_code: '500',
        is_success: false,
        error_code: 'UPDATE_PRODUCT_ERROR',
        data: null,
      };
    }
  }

  // Delete product (if supported by backend)
  static async deleteProduct(productId: string): Promise<ApiResponse<null>> {
    try {
      if (!productId || !productId.trim()) {
        throw new Error('Product ID is required');
      }

      const response = await apiClient.delete(`/product?productId=${encodeURIComponent(productId)}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete product error:', error);
      
      if (error.message && !error.response) {
        throw error;
      }
      
      return {
        status_code: '500',
        is_success: false,
        error_code: 'DELETE_PRODUCT_ERROR',
        data: null,
      };
    }
  }

  // Utility methods for data validation and cleaning
  private static validateProductData(data: CreateProductData): string | null {
    if (!data.product_title || !data.product_title.trim()) {
      return 'Product title is required';
    }

    if (data.product_title.trim().length < 2) {
      return 'Product title must be at least 2 characters long';
    }

    if (data.product_title.trim().length > 200) {
      return 'Product title must be less than 200 characters';
    }

    if (typeof data.product_price !== 'number') {
      return 'Product price must be a number';
    }

    if (data.product_price < 0) {
      return 'Product price cannot be negative';
    }

    if (data.product_price > 999999.99) {
      return 'Product price cannot exceed $999,999.99';
    }

    if (data.product_description && data.product_description.length > 1000) {
      return 'Product description must be less than 1000 characters';
    }

    if (data.product_category && data.product_category.length > 100) {
      return 'Product category must be less than 100 characters';
    }

    if (data.product_image && data.product_image.length > 500) {
      return 'Product image URL must be less than 500 characters';
    }

    // Validate URL format if image URL is provided
    if (data.product_image && data.product_image.trim()) {
      try {
        new URL(data.product_image);
      } catch {
        return 'Product image must be a valid URL';
      }
    }

    return null;
  }

  private static cleanProductData<T extends CreateProductData | UpdateProductData>(data: T): T {
    const cleaned = { ...data };

    // Trim string fields
    if (cleaned.product_title) {
      cleaned.product_title = cleaned.product_title.trim();
    }

    if (cleaned.product_description) {
      cleaned.product_description = cleaned.product_description.trim();
      // Remove empty description
      if (!cleaned.product_description) {
        delete cleaned.product_description;
      }
    }

    if (cleaned.product_category) {
      cleaned.product_category = cleaned.product_category.trim();
      // Remove empty category
      if (!cleaned.product_category) {
        delete cleaned.product_category;
      }
    }

    if (cleaned.product_image) {
      cleaned.product_image = cleaned.product_image.trim();
      // Remove empty image URL
      if (!cleaned.product_image) {
        delete cleaned.product_image;
      }
    }

    // Round price to 2 decimal places
    if (cleaned.product_price !== undefined) {
      cleaned.product_price = Math.round(cleaned.product_price * 100) / 100;
    }

    return cleaned;
  }

  // Utility method to check API health
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Utility method to get API configuration
  static getApiConfig(): AxiosRequestConfig {
    const config: AxiosRequestConfig = {};
    
    if (apiClient.defaults.baseURL !== undefined) {
      config.baseURL = apiClient.defaults.baseURL;
    }
    
    if (apiClient.defaults.timeout !== undefined) {
      config.timeout = apiClient.defaults.timeout;
    }
    
    return config;
  }
}
