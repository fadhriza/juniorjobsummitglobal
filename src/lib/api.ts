// src/lib/api.ts
import axios from 'axios';
import { auth } from './firebase';
import { Product, CreateProductData, UpdateProductData, ApiResponse, ProductListParams } from '../types';

// Create axios instance for internal API routes
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Firebase auth token
apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Service class
export class ApiService {
  // Get products with pagination and search
  static async getProducts(params?: Partial<ProductListParams>): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiClient.get(`/products?${queryParams}`);
    return response.data;
  }

  // Get single product by ID
  static async getProduct(productId: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get(`/product?product_id=${productId}`);
    return response.data;
  }

  // Create new product
  static async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    const response = await apiClient.post('/product', productData);
    return response.data;
  }

  // Update existing product
  static async updateProduct(productId: string, productData: UpdateProductData): Promise<ApiResponse<Product>> {
    const response = await apiClient.put('/product', {
      product_id: productId,
      ...productData
    });
    return response.data;
  }
}