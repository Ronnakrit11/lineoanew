import { NextRequest, NextResponse } from 'next/server';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';
import { broadcastMessageUpdate } from '@/lib/messageService';

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

    // Find or create widget conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        channelId: 'widget',
        userId: 'widget-user',
        platform: 'LINE'
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          channelId: 'widget',
          userId: 'widget-user',
          platform: 'LINE'
        }
      });
    }
    // Create message in database
    const message = await prisma.message.create({
      data: {
        content,
        sender: 'USER',
        platform: 'LINE',
        conversationId: conversation.id
      }
    });
    // Broadcast to widget channel
    await pusherServer.trigger(
      `private-widget-chat`,
      PUSHER_EVENTS.MESSAGE_RECEIVED,
      {
        id: message.id,
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp,
        status: 'DELIVERED'
      }
    );

    // Broadcast to admin channel
    await pusherServer.trigger(
      `private-${PUSHER_CHANNELS.CHAT}`,
      PUSHER_EVENTS.MESSAGE_RECEIVED,
      {
        id: message.id,
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp,
        status: 'DELIVERED'
      }
    );

    // Broadcast conversation update
    await broadcastMessageUpdate(conversation.id);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error handling widget message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get recent messages
    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          channelId: 'widget'
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching widget messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}