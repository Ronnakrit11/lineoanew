import { NextRequest, NextResponse } from 'next/server';
import { handleFacebookMessage } from '@/lib/services/facebook/conversation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get verification params from query string
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Log verification attempt
    console.log('Facebook webhook verification:', {
      mode,
      token,
      challenge,
      expectedToken: process.env.FACEBOOK_VERIFY_TOKEN
    });

    // Verify token
    if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
      if (!challenge) {
        return new NextResponse('Missing challenge', { status: 400 });
      }
      
      // Return challenge string for successful verification
      return new NextResponse(challenge, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    // Return error for failed verification
    return new NextResponse('Invalid verification token', { 
      status: 403,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error('Error in Facebook webhook verification:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
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