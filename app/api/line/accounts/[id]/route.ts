import { NextRequest, NextResponse } from 'next/server';
import { findLineAccountById, updateLineAccount } from '@/lib/services/line';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const account = await findLineAccountById(id);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching LINE account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const  {imageUrl} = body;
    
    const result = await updateLineAccount(id, {
      companyName: body.companyName?.trim() || null,
      imageUrl:imageUrl || null,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update account' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.account);
  } catch (error) {
    console.error('Error updating LINE account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}