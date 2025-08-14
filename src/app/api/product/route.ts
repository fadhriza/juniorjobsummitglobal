// src/app/api/product/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const EXTERNAL_API_BASE = process.env.EXTERNAL_API_BASE || 'https://technical-test-be-production.up.railway.app';

// GET single product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization');
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Call external API
    const response = await axios.get(
      `${EXTERNAL_API_BASE}/api/web/v1/product?product_id=${productId}`,
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Product GET API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// POST create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization');
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Call external API
    const response = await axios.post(
      `${EXTERNAL_API_BASE}/api/web/v1/product`,
      body,
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Product POST API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization');
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Call external API
    const response = await axios.put(
      `${EXTERNAL_API_BASE}/api/web/v1/product`,
      body,
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Product PUT API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}