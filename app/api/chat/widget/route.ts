import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { PUSHER_EVENTS, PUSHER_CHANNELS } from '@/app/config/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create conversation and message in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          platform: 'WEBSITE',
          channelId: 'website-chat',
          userId: `web-${Date.now()}`,
        }
      });

      // Create message
      const message = await tx.message.create({
        data: {
          conversationId: conversation.id,
          content: content.trim(),
          sender: 'USER',
          platform: 'WEBSITE',
          chatType: 'website',
          chatId: conversation.id,
          timestamp: new Date()
        }
      });

      return { conversation, message };
    });

    // Broadcast updates
    await Promise.all([
      pusherServer.trigger(
        PUSHER_CHANNELS.CHAT,
        PUSHER_EVENTS.MESSAGE_RECEIVED,
        {
          ...result.message,
          timestamp: result.message.timestamp.toISOString()
        }
      ),
      pusherServer.trigger(
        PUSHER_CHANNELS.CHAT,
        PUSHER_EVENTS.CONVERSATION_UPDATED,
        {
          ...result.conversation,
          messages: [result.message],
          updatedAt: result.conversation.updatedAt.toISOString()
        }
      )
    ]);

    return NextResponse.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error handling widget message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}