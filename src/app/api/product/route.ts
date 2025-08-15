// src/app/api/product/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = 'https://technical-test-be-production.up.railway.app';

// GET single product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    
    if (!productId) {
      return NextResponse.json(
        { 
          status_code: '400',
          is_success: false,
          error_code: 'MISSING_PRODUCT_ID',
          data: null,
          message: 'Product ID is required'
        }, 
        { status: 400 }
      );
    }
    
    const authorization = request.headers.get('authorization');
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await axios.get(
      `${BACKEND_URL}/api/web/v1/product?product_id=${productId}`,
      { headers }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Get Product API Error:', error);
    return NextResponse.json(
      { 
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_ERROR',
        data: null,
        message: error.response?.data?.message || 'Failed to fetch product'
      }, 
      { status: 500 }
    );
  }
}

// POST create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await axios.post(
      `${BACKEND_URL}/api/web/v1/product`,
      body,
      { headers }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Create Product API Error:', error);
    return NextResponse.json(
      { 
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_ERROR',
        data: null,
        message: error.response?.data?.message || 'Failed to create product'
      }, 
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await axios.put(
      `${BACKEND_URL}/api/web/v1/product`,
      body,
      { headers }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Update Product API Error:', error);
    return NextResponse.json(
      { 
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_ERROR',
        data: null,
        message: error.response?.data?.message || 'Failed to update product'
      }, 
      { status: 500 }
    );
  }
}