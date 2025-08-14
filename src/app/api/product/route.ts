// app/api/product/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const EXTERNAL_API_BASE = 'https://external-api.com/api/web/v1'; // Replace with actual API URL

// GET single product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
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

    // Get authorization token from request headers
    const authToken = request.headers.get('Authorization');
    
    // Make request to external API
    const response = await axios.get(`${EXTERNAL_API_BASE}/product?product_id=${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      },
      timeout: 10000
    });

    return NextResponse.json(response.data);
    
  } catch (error: any) {
    console.error('Get Product API Error:', error);
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        {
          status_code: '404',
          is_success: false,
          error_code: 'PRODUCT_NOT_FOUND',
          data: null,
          message: 'Product not found'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_SERVER_ERROR',
        data: null,
        message: 'Failed to fetch product'
      }, 
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { product_title, product_price } = body;
    
    if (!product_title || product_price === undefined || product_price === null) {
      return NextResponse.json(
        { 
          status_code: '400',
          is_success: false,
          error_code: 'VALIDATION_ERROR',
          data: null,
          message: 'Product title and price are required'
        }, 
        { status: 400 }
      );
    }

    if (typeof product_price !== 'number' || product_price < 0) {
      return NextResponse.json(
        { 
          status_code: '400',
          is_success: false,
          error_code: 'INVALID_PRICE',
          data: null,
          message: 'Price must be a positive number'
        }, 
        { status: 400 }
      );
    }

    // Get authorization token from request headers
    const authToken = request.headers.get('Authorization');
    
    // Make request to external API
    const response = await axios.post(`${EXTERNAL_API_BASE}/product`, body, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      },
      timeout: 15000 // Longer timeout for POST requests
    });

    return NextResponse.json(response.data);
    
  } catch (error: any) {
    console.error('Create Product API Error:', error);
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        {
          status_code: '400',
          is_success: false,
          error_code: 'VALIDATION_ERROR',
          data: null,
          message: error.response.data?.message || 'Validation error'
        },
        { status: 400 }
      );
    }
    
    if (error.response?.status === 409) {
      return NextResponse.json(
        {
          status_code: '409',
          is_success: false,
          error_code: 'PRODUCT_EXISTS',
          data: null,
          message: 'Product already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_SERVER_ERROR',
        data: null,
        message: 'Failed to create product'
      }, 
      { status: 500 }
    );
  }
}

// PUT update existing product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate product_id is present
    const { product_id } = body;
    
    if (!product_id) {
      return NextResponse.json(
        { 
          status_code: '400',
          is_success: false,
          error_code: 'MISSING_PRODUCT_ID',
          data: null,
          message: 'Product ID is required for update'
        }, 
        { status: 400 }
      );
    }

    // Validate price if provided
    if (body.product_price !== undefined && body.product_price !== null) {
      if (typeof body.product_price !== 'number' || body.product_price < 0) {
        return NextResponse.json(
          { 
            status_code: '400',
            is_success: false,
            error_code: 'INVALID_PRICE',
            data: null,
            message: 'Price must be a positive number'
          }, 
          { status: 400 }
        );
      }
    }

    // Get authorization token from request headers
    const authToken = request.headers.get('Authorization');
    
    // Make request to external API
    const response = await axios.put(`${EXTERNAL_API_BASE}/product`, body, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      },
      timeout: 15000
    });

    return NextResponse.json(response.data);
    
  } catch (error: any) {
    console.error('Update Product API Error:', error);
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        {
          status_code: '404',
          is_success: false,
          error_code: 'PRODUCT_NOT_FOUND',
          data: null,
          message: 'Product not found'
        },
        { status: 404 }
      );
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        {
          status_code: '400',
          is_success: false,
          error_code: 'VALIDATION_ERROR',
          data: null,
          message: error.response.data?.message || 'Validation error'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_SERVER_ERROR',
        data: null,
        message: 'Failed to update product'
      }, 
      { status: 500 }
    );
  }
}