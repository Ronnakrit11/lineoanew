import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createToken } from '@/lib/auth/token';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth/constants';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        password // In a real app, hash the password first!
      }
    });
    
    // Create token with username and default tenant
    const token = await createToken({ 
      username: user.username
    });

    // Set cookie
    cookies().set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}