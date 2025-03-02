import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
  try {
    // Create a cookie that expires immediately to clear the auth token
    const cookieHeader = serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Expire immediately
      path: '/'
    });

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 });
    
    // Add the cookie to the response
    response.headers.set('Set-Cookie', cookieHeader);
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}