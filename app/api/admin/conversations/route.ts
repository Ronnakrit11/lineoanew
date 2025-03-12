import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth/token';

const prisma = new PrismaClient();

// Assign conversation to admin
export async function POST(request: NextRequest) {
  try {
    // Verify super admin token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isValid, payload } = await verifyToken(token.value);
    if (!isValid || !payload?.username) {
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
    const { conversationId, adminId } = body;

    // Validate input
    if (!conversationId || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create assignment
    const assignment = await prisma.conversationAssignment.create({
      data: {
        conversationId,
        adminId,
        assignedBy: currentAdmin.id
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error assigning conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get conversations for admin
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isValid, payload } = await verifyToken(token.value);
    if (!isValid || !payload?.username) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get current admin
    const admin = await prisma.admin.findUnique({
      where: { username: payload.username }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Get conversations based on role
    let conversations;
    if (admin.role === 'SUPER_ADMIN') {
      // Super admin can see all conversations
      conversations = await prisma.conversation.findMany({
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1
          },
          assignments: {
            include: {
              admin: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    } else {
      // Regular admin can only see assigned conversations
      conversations = await prisma.conversation.findMany({
        where: {
          assignments: {
            some: {
              adminId: admin.id
            }
          }
        },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}