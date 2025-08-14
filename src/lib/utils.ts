// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { Product, DashboardStats, CategoryStats } from '../types';

/**
 * Utility function to combine class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format currency with proper locale formatting
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Format numbers with proper locale formatting
 */
export function formatNumber(
  num: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch (error) {
    return num.toString();
  }
}

/**
 * Format date with proper locale formatting
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
      long: { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
      full: { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      },
    }[format] as Intl.DateTimeFormatOptions;

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    return date.toString();
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: string | Date,
  locale: string = 'en-US'
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch (error) {
    return formatDate(date, 'short');
  }
}

/**
 * Debounce function for optimizing API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for limiting function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean and validate product title
 */
export function cleanProductTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s-_.]/g, '') // Remove special characters except common ones
    .slice(0, 200); // Limit length
}

/**
 * Calculate dashboard statistics from products array
 */
export function calculateDashboardStats(products: Product[]): DashboardStats {
  if (!products || products.length === 0) {
    return {
      totalProducts: 0,
      totalValue: 0,
      avgPrice: 0,
      categories: 0,
      recentlyAdded: 0,
      popularCategories: [],
    };
  }

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + product.product_price, 0);
  const avgPrice = totalValue / totalProducts;

  // Calculate unique categories
  const categoryMap = new Map<string, CategoryStats>();
  
  products.forEach((product) => {
    const category = product.product_category || 'Uncategorized';
    
    if (categoryMap.has(category)) {
      const existing = categoryMap.get(category)!;
      existing.count += 1;
      existing.totalValue += product.product_price;
      existing.avgPrice = existing.totalValue / existing.count;
    } else {
      categoryMap.set(category, {
        category,
        count: 1,
        totalValue: product.product_price,
        avgPrice: product.product_price,
      });
    }
  });

  const categories = categoryMap.size;
  const popularCategories = Array.from(categoryMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate recently added (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentlyAdded = products.filter((product) => {
    const createdDate = new Date(product.created_timestamp);
    return createdDate >= sevenDaysAgo;
  }).length;

  // Find most expensive and cheapest products
  const sortedByPrice = [...products].sort((a, b) => b.product_price - a.product_price);
  const mostExpensive = sortedByPrice[0];
  const cheapest = sortedByPrice[sortedByPrice.length - 1];

  const result: DashboardStats = {
    totalProducts,
    totalValue,
    avgPrice,
    categories,
    recentlyAdded,
    popularCategories,
  };

  // Only add mostExpensive and cheapest if they exist
  if (mostExpensive) {
    result.mostExpensive = mostExpensive;
  }
  if (cheapest) {
    result.cheapest = cheapest;
  }

  return result;
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string = 'data.json'): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download JSON:', error);
  }
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: Product[], filename: string = 'products.csv'): void {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Define CSV headers
    const headers = [
      'Product ID',
      'Title',
      'Price',
      'Description',
      'Category',
      'Image URL',
      'Created',
      'Updated',
    ];

    // Convert data to CSV format
    const csvContent = [
      headers.join(','),
      ...data.map((product) => [
        `"${product.product_id}"`,
        `"${product.product_title.replace(/"/g, '""')}"`,
        product.product_price,
        `"${(product.product_description || '').replace(/"/g, '""')}"`,
        `"${(product.product_category || '').replace(/"/g, '""')}"`,
        `"${(product.product_image || '').replace(/"/g, '""')}"`,
        `"${formatDate(product.created_timestamp, 'short')}"`,
        `"${formatDate(product.updated_timestamp, 'short')}"`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download CSV:', error);
    throw error;
  }
}

/**
 * Local storage utilities with error handling
 */
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue || null;
      
      const item = localStorage.getItem(key);
      if (!item) return defaultValue || null;
      
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error);
      return defaultValue || null;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error);
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage', error);
      return false;
    }
  },
};

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth < 768;
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Scroll to element smoothly
 */
export function scrollToElement(elementId: string, offset: number = 0): void {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth',
    });
  }
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate random color for avatars or placeholders
 */
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)] || '#3b82f6';
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}