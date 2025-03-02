import { NextRequest, NextResponse } from 'next/server';
import { getRow } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

interface LoginRequest {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await getRow<User>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // Set cookie with the token
    const cookieHeader = setAuthCookie(token);

    // Return success response with user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword
    }, { status: 200 });
    
    // Add the cookie to the response
    response.headers.set('Set-Cookie', cookieHeader);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}