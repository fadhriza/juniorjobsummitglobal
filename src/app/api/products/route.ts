// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    
    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query params for external API
    const params = new URLSearchParams({
      page,
      limit,
      offset: offset.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    // Get authorization header from request
    const authorization = request.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (authorization) {
      headers.Authorization = authorization;
    }

    console.log('Fetching products from backend:', `${BACKEND_URL}/api/web/v1/products?${params}`);
    
    const response = await axios.get(
      `${BACKEND_URL}/api/web/v1/products?${params}`,
      { 
        headers,
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log('Backend response status:', response.status);
    console.log('Backend response data structure:', {
      is_success: response.data.is_success,
      data_length: Array.isArray(response.data.data) ? response.data.data.length : 'not array',
      pagination: response.data.pagination
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Products API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return NextResponse.json(
      { 
        status_code: error.response?.status?.toString() || '500',
        is_success: false,
        error_code: error.response?.data?.error_code || 'INTERNAL_ERROR',
        data: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch products'
      }, 
      { status: error.response?.status || 500 }
    );
  }
}