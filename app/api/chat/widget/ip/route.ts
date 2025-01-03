import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/utils/ip';

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request) || 'unknown';
    return NextResponse.json({ ip });
  } catch (error) {
    console.error('Error getting client IP:', error);
    return NextResponse.json(
      { error: 'Failed to get IP address' },
      { status: 500 }
    );
  }
}