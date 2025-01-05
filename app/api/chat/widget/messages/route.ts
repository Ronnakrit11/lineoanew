import { NextRequest, NextResponse } from 'next/server';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/utils/ip';
import { chunkMessage } from '@/lib/utils/messageChunking';

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

    // Chunk large messages if needed
    const messageChunks = chunkMessage(content);

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
    const messagePromises = messageChunks.map(chunk => prisma.message.create({
      data: {
        content: chunk,
        sender: 'USER',
        platform: 'WIDGET',
        conversationId: conversation.id,
        chatId: ip,
        timestamp: new Date()
      }
    }));

    const messages = await Promise.all(messagePromises);
    const primaryMessage = messages[0]; // Use first chunk as primary message

    // Broadcast to widget channel
    await pusherServer.trigger(
      `private-widget-chat`,
      PUSHER_EVENTS.MESSAGE_RECEIVED,
      {
        id: primaryMessage.id,
        content: content, // Send full content
        sender: primaryMessage.sender,
        timestamp: primaryMessage.timestamp,
        conversationId: conversation.id,
        platform: 'WIDGET',
        status: 'DELIVERED'
      }
    );

    // Broadcast to admin channel
    await pusherServer.trigger(
      PUSHER_CHANNELS.CHAT,
      PUSHER_EVENTS.CONVERSATIONS_UPDATED,
      {
        conversations: await prisma.conversation.findMany({
          where: {
            platform: 'WIDGET'
          },
          include: {
            messages: {
              orderBy: {
                timestamp: 'desc'
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        })
      }
    );


    return NextResponse.json({
      id: primaryMessage.id,
      content: content,
      sender: primaryMessage.sender,
      timestamp: primaryMessage.timestamp,
      conversationId: conversation.id,
      status: 'DELIVERED'
    });
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
        platform: 'WIDGET'
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'desc'
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