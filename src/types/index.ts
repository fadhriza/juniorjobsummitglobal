// Core Product Interface
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

// Product Creation Data (Required fields only)
export interface CreateProductData {
  product_title: string;
  product_price: number;
  product_description?: string;
  product_image?: string;
  product_category?: string;
}

// Product Update Data (All fields optional except those being updated)
export interface UpdateProductData {
  product_title?: string;
  product_price?: number;
  product_description?: string;
  product_image?: string;
  product_category?: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  status_code: string;
  is_success: boolean;
  error_code: string | null;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

// Pagination Information
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  search: string | null;
  has_next?: boolean;
  has_previous?: boolean;
}

// Products List Query Parameters
export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort_by?: 'title' | 'price' | 'created' | 'updated';
  sort_order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
}

// Error Response from API
export interface ApiError {
  status_code: string;
  error_code: string;
  message: string;
  details?: string;
  timestamp?: string;
}

// User Authentication Interfaces
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

// Dashboard Statistics
export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  avgPrice: number;
  categories: number;
  recentlyAdded: number;
  mostExpensive?: Product;
  cheapest?: Product;
  popularCategories?: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  count: number;
  totalValue: number;
  avgPrice: number;
}

// Form State Interfaces
export interface ProductFormData {
  product_title: string;
  product_price: number | string;
  product_description: string;
  product_image: string;
  product_category: string;
}

export interface ProductFormErrors {
  product_title?: string;
  product_price?: string;
  product_description?: string;
  product_image?: string;
  product_category?: string;
  general?: string;
}

// Modal State Types
export type ModalMode = 'create' | 'edit' | 'view' | 'delete';

export interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
  product: Product | null;
}

// Table State and Configuration
export interface TableColumn {
  key: keyof Product | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: Product) => React.ReactNode;
}

export interface TableState {
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  expandedRows: Set<string>;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch?: Date;
}

// Filter and Search Interfaces
export interface SearchFilters {
  search: string;
  category: string;
  priceRange: {
    min: number;
    max: number;
  };
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface SortOption {
  value: string;
  label: string;
  field: keyof Product;
  order: 'asc' | 'desc';
}

// Image Handling
export interface ImageState {
  src: string;
  alt: string;
  loading: boolean;
  error: boolean;
  fallbackUsed: boolean;
}

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

// Toast Notification Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

// Theme and UI Types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    text: string;
    background: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Local Storage Types
export interface StorageItem<T> {
  value: T;
  timestamp: number;
  expires?: number;
}

// Event Handler Types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Environment Types
export type Environment = 'development' | 'staging' | 'production';

// Export types for external use
export type {
  Product as IProduct,
  CreateProductData as ICreateProduct,
  UpdateProductData as IUpdateProduct,
  ApiResponse as IApiResponse,
  PaginationInfo as IPagination,
};