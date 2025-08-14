// src/types/index.ts
export interface Product {
  product_id: string;
  product_title: string;
  product_price: number;
  product_description?: string;
  product_image?: string;
  product_category?: string;
  created_timestamp: string;
  updated_timestamp: string;
}

export interface CreateProductData {
  product_title: string;
  product_price: number;
  product_description?: string;
  product_image?: string;
  product_category?: string;
}

export interface UpdateProductData {
  product_title?: string;
  product_price?: number;
  product_description?: string;
  product_image?: string;
  product_category?: string;
}

export interface ProductListParams {
  page: number;
  limit: number;
  offset: number;
  search?: string;
}

export interface ApiResponse<T> {
  status_code: string;
  is_success: boolean;
  error_code: string | null;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    search: string | null;
  };
}

export interface AuthContext {
  user: any | null;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  loading: boolean;
}