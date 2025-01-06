import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/auth/token';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Check credentials against environment variables
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Create token with username and default tenant
      const token = await createToken({ 
        username
      });

      // Set cookie with updated options
      cookies().set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}