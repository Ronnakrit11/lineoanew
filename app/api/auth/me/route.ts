import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth/token';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isValid, payload } = await verifyToken(token.value);
    if (!isValid || !payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username: payload.username },
      select: {
        id: true,
        username: true,
        role: true
      }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}