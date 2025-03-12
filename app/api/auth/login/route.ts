import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/auth/token';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth/constants';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Check if it's the initial super admin login
    if (username === process.env.ADMIN_USERNAME) {
      const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || '');
      
      // Create super admin if it doesn't exist
      const superAdmin = await prisma.admin.upsert({
        where: { username },
        update: {},
        create: {
          username,
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });

      if (await verifyPassword(password, superAdmin.password)) {
        const token = await createToken({ username });
        cookies().set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
        return NextResponse.json({ success: true });
      }
    }

    // Regular admin login
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await createToken({ username });
    cookies().set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}