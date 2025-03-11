import { NextRequest, NextResponse } from 'next/server';
import { handleFacebookMessage } from '@/lib/services/facebook/conversation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  
  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle Facebook webhook events
    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        if (!webhookEvent) continue;

        const senderId = webhookEvent.sender.id;
        const pageId = entry.id;
        const message = webhookEvent.message?.text;
        const timestamp = new Date(webhookEvent.timestamp);

        if (message) {
          await handleFacebookMessage(
            senderId,
            pageId,
            message,
            timestamp
          );
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Facebook webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}