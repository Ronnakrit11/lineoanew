import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth/token';
import { hashPassword } from '@/lib/auth/password';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isValid, payload } = await verifyToken(token.value);
    if (!isValid || !payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get current admin
    const currentAdmin = await prisma.admin.findUnique({
      where: { username: payload.username }
    });

    if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if username exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Create new admin
    const hashedPassword = await hashPassword(password);
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        role: 'USER',
        createdBy: currentAdmin.id
      }
    });

    return NextResponse.json({
      id: newAdmin.id,
      username: newAdmin.username,
      role: newAdmin.role
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isValid, payload } = await verifyToken(token.value);
    if (!isValid || !payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get admins (exclude password field)
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}