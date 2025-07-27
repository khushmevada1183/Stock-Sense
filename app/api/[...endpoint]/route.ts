import { NextRequest, NextResponse } from 'next/server';

// API proxy handler for all documented Indian Stock API endpoints
export async function GET(
  request: NextRequest,
  { params }: { params: { endpoint: string[] } }
) {
  try {
    // Get the endpoint path from the URL segments
    const endpoint = params.endpoint.join('/');
    
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Construct the backend API URL
    const backendUrl = `http://localhost:10000/api/${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    console.log(`[API Proxy] ${request.method} ${endpoint} -> ${backendUrl}`);
    
    // Forward the request to our Express backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward any relevant headers from the original request
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
      },
    });
    
    if (!response.ok) {
      console.error(`[API Proxy] Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Backend API error: ${response.statusText}`,
            code: 'BACKEND_ERROR',
            statusCode: response.status,
            timestamp: new Date().toISOString()
          }
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    console.log(`[API Proxy] Success: ${endpoint}`);
    
    // Return the data from our backend
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(
  request: NextRequest,
  { params }: { params: { endpoint: string[] } }
) {
  try {
    const endpoint = params.endpoint.join('/');
    const body = await request.json();
    
    const backendUrl = `http://localhost:10000/api/${endpoint}`;
    
    console.log(`[API Proxy] POST ${endpoint} -> ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error(`[API Proxy] Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Backend API error: ${response.statusText}`,
            code: 'BACKEND_ERROR',
            statusCode: response.status,
            timestamp: new Date().toISOString()
          }
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[API Proxy] POST Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// Handle PUT requests
export async function PUT(
  request: NextRequest,
  { params }: { params: { endpoint: string[] } }
) {
  try {
    const endpoint = params.endpoint.join('/');
    const body = await request.json();
    
    const backendUrl = `http://localhost:10000/api/${endpoint}`;
    
    console.log(`[API Proxy] PUT ${endpoint} -> ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Backend API error: ${response.statusText}`,
            code: 'BACKEND_ERROR',
            statusCode: response.status,
            timestamp: new Date().toISOString()
          }
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[API Proxy] PUT Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// Handle DELETE requests
export async function DELETE(
  request: NextRequest,
  { params }: { params: { endpoint: string[] } }
) {
  try {
    const endpoint = params.endpoint.join('/');
    
    const backendUrl = `http://localhost:10000/api/${endpoint}`;
    
    console.log(`[API Proxy] DELETE ${endpoint} -> ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Backend API error: ${response.statusText}`,
            code: 'BACKEND_ERROR',
            statusCode: response.status,
            timestamp: new Date().toISOString()
          }
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[API Proxy] DELETE Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
