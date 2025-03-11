import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyFacebookPageToken } from '@/lib/services/facebook/verify';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, pageAccessToken } = body;

    if (!pageId || !pageAccessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the page access token
    const verification = await verifyFacebookPageToken(pageId, pageAccessToken);
    if (!verification.isValid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid page access token' },
        { status: 400 }
      );
    }

    // Create Facebook page in database
    const page = await prisma.facebookPage.create({
      data: {
        pageId,
        accessToken: pageAccessToken,
        name: verification.pageName || 'Facebook Page',
        active: true
      }
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error creating Facebook page:', error);
    return NextResponse.json(
      { error: 'Failed to create Facebook page' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const pages = await prisma.facebookPage.findMany({
      where: { active: true },
      select: {
        id: true,
        pageId: true,
        name: true,
        active: true
      }
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching Facebook pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Facebook pages' },
      { status: 500 }
    );
  }
}