import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, email, password, fullName } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await executeQuery<any[]>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const result = await executeQuery<any>(
      'INSERT INTO users (username, email, password, full_name, email_verified) VALUES (?, ?, ?, ?, FALSE)',
      [username, email, hashedPassword, fullName || null]
    );

    // Get the inserted user ID
    const userId = result.insertId;

    // Generate verification token and send verification email
    const verificationToken = await generateVerificationToken(userId);
    const emailSent = await sendVerificationEmail(email, verificationToken);

    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
      // Continue with registration even if email fails, but log the error
    }

    // Generate JWT token
    const user: User = {
      id: userId,
      username,
      email,
      role: 'user'
    };
    
    const token = generateToken(user);

    // Set cookie with the token
    const cookieHeader = setAuthCookie(token);

    // Return success response with verification token
    const response = NextResponse.json({
      success: true,
      user,
      emailVerificationSent: emailSent,
      verificationToken: verificationToken // Include the token for the verification modal
    }, { status: 201 });
    
    // Add the cookie to the response
    response.headers.set('Set-Cookie', cookieHeader);
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}