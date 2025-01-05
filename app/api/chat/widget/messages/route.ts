import { NextRequest, NextResponse } from 'next/server';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/utils/ip';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, userId, platform } = body;
    const ip = getClientIp(request) || 'unknown';

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
        userId,
        platform
      },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          channelId: 'widget',
          userId,
          platform
        },
        include: {
          messages: true
        }
      });
    }

    // Create message in database
    const message = await prisma.message.create({
      data: {
        id: `msg-${Date.now()}-${Math.random()}`,
        content,
        sender: 'USER',
        platform: 'WIDGET',
        conversationId: conversation.id,
        chatId: ip,
        timestamp: new Date()
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
        conversationId: conversation.id,
        platform: 'WIDGET',
        status: 'DELIVERED'
      }
    );

    // Broadcast to admin channel
    await pusherServer.trigger(
      PUSHER_CHANNELS.CHAT,
      PUSHER_EVENTS.MESSAGE_RECEIVED,
      message
    );

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    // Broadcast conversation update
    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (updatedConversation) {
      await pusherServer.trigger(
        PUSHER_CHANNELS.CHAT,
        PUSHER_EVENTS.CONVERSATION_UPDATED,
        updatedConversation
      );
    }

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
    const messages = await prisma.conversation.findMany({
      where: {
        channelId: 'widget',
        platform: 'WIDGET',
        messages: {
          some: {} // Only get conversations with messages
        }
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      conversations: messages
    });
  } catch (error) {
    console.error('Error fetching widget messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}