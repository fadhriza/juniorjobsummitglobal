// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const EXTERNAL_API_BASE = process.env.EXTERNAL_API_BASE || 'https://technical-test-be-production.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

    // Calculate offset from page and limit
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query parameters for external API
    const queryParams = new URLSearchParams({
      page,
      limit,
      offset: offset.toString(),
    });

    if (search) {
      queryParams.append('search', search);
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
      `${EXTERNAL_API_BASE}/api/web/v1/products?${queryParams}`,
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}