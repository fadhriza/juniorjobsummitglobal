// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const EXTERNAL_API_BASE = 'https://external-api.com/api/web/v1'; // Replace with actual API URL

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search');
    
    // Calculate offset from page and limit
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query parameters for external API
    const params = new URLSearchParams({
      page,
      limit,
      offset: offset.toString()
    });
    
    if (search) {
      params.append('search', search);
    }

    // Get authorization token from request headers
    const authToken = request.headers.get('Authorization');
    
    // Make request to external API
    const response = await axios.get(`${EXTERNAL_API_BASE}/products?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      },
      timeout: 10000 // 10 second timeout
    });

    // Return the response from external API
    return NextResponse.json(response.data);
    
  } catch (error: any) {
    console.error('Products API Error:', error);
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { 
          status_code: '408',
          is_success: false,
          error_code: 'REQUEST_TIMEOUT',
          data: [],
          message: 'Request timeout'
        }, 
        { status: 408 }
      );
    }
    
    if (error.response) {
      // External API returned an error
      return NextResponse.json(
        {
          status_code: error.response.status.toString(),
          is_success: false,
          error_code: 'EXTERNAL_API_ERROR',
          data: [],
          message: error.response.data?.message || 'External API error'
        },
        { status: error.response.status }
      );
    }
    
    // Network or other errors
    return NextResponse.json(
      { 
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_SERVER_ERROR',
        data: [],
        message: 'Failed to fetch products'
      }, 
      { status: 500 }
    );
  }
}