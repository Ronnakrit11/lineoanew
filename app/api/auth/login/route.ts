import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/auth/token';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth/constants';
import { verifyPassword } from '@/lib/auth/password';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Find user with tenant info
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        tenant: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (isValid) {
      // Create JWT token with tenant info
      const token = await createToken({ 
        username: user.username,
        tenantId: user.tenantId,
        role: user.role
      });

      // Set cookie with updated options
      cookies().set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

      return NextResponse.json({ 
        success: true,
        user: {
          username: user.username,
          role: user.role,
          tenant: user.tenant ? {
            id: user.tenant.id,
            name: user.tenant.name
          } : null
        }
      });
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