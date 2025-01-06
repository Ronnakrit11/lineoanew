import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createToken } from '@/lib/auth/token';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth/constants';
import { cookies } from 'next/headers';
import { hashPassword } from '@/lib/auth/password';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, tenantName } = body;

    // Validate each field individually for better error messages
    if (!username?.trim()) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!password?.trim()) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!tenantName?.trim()) {
      return NextResponse.json(
        { error: 'Tenant name is required' },
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create tenant and user in a transaction
    const { user, tenant } = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName
        }
      });

      // Create user with tenant
      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          role: 'ADMIN',
          tenantId: tenant.id
        }
      });

      return { user, tenant };
    });

    // Create JWT token with tenant info
    const token = await createToken({ 
      username: user.username,
      tenantId: tenant.id,
      role: user.role
    });

    // Set cookie
    cookies().set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return NextResponse.json({ 
      success: true,
      user: {
        username: user.username,
        role: user.role,
        tenant: {
          id: tenant.id,
          name: tenant.name
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}