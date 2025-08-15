// src/lib/api.ts

import axios from 'axios';
import { Product, CreateProductData, UpdateProductData, ApiResponse, ProductListParams } from '../types';

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service class
export class ApiService {
  // Get products with pagination and search
  static async getProducts(params?: Partial<ProductListParams>, token?: string | null): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search && params.search.trim()) queryParams.append('search', params.search);

    const headers: any = {};
    if (token) {
      headers.Authorization = token;
    }

    const response = await apiClient.get(`/products?${queryParams}`, { headers });
    return response.data;
  }

  // Get single product by ID
  static async getProduct(productId: string, token?: string | null): Promise<ApiResponse<Product>> {
    const headers: any = {};
    if (token) {
      headers.Authorization = token;
    }

    const response = await apiClient.get(`/product?product_id=${productId}`, { headers });
    return response.data;
  }

  // Create new product
  static async createProduct(productData: CreateProductData, token?: string | null): Promise<ApiResponse<Product>> {
    const headers: any = {};
    if (token) {
      headers.Authorization = token;
    }

    const response = await apiClient.post('/product', productData, { headers });
    return response.data;
  }

  // Update existing product
  static async updateProduct(productId: string, productData: UpdateProductData, token?: string | null): Promise<ApiResponse<Product>> {
    const headers: any = {};
    if (token) {
      headers.Authorization = token;
    }

    const response = await apiClient.put('/product', {
      product_id: productId,
      ...productData
    }, { headers });
    return response.data;
  }
}