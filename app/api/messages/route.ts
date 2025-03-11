import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendLineMessage } from '@/lib/services/line/message/send';
import { sendFacebookMessage } from '@/lib/services/facebook/send';
import { pusherServer, PUSHER_EVENTS } from '@/lib/pusher';
import { broadcastMessageUpdate } from '@/lib/messageService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, content, platform } = body;

    if (!conversationId || !content || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Create bot message
    let messageSent = false;

    const botMessage = await prisma.message.create({
      data: {
        conversationId,
        content,
        sender: 'BOT',
        platform,
        timestamp: new Date(),
      },
    });
    
    // Handle widget conversation
    if (conversation.channelId === 'widget') {
      await pusherServer.trigger(
        `private-widget-chat`,
        PUSHER_EVENTS.MESSAGE_RECEIVED,
        {
          id: botMessage.id,
          content: botMessage.content,
          sender: botMessage.sender,
          timestamp: botMessage.timestamp,
          conversationId: conversation.id,
          platform: 'WIDGET',
          status: 'DELIVERED'
        }
      );
      messageSent = true;
    }

    // Send to platform
    if (platform === 'LINE' && conversation.channelId !== 'widget') {
      const result = await sendLineMessage(
        conversation.userId,
        content,
        conversation.lineAccountId
      );
      messageSent = result.success;
    } else if (platform === 'FACEBOOK') {
      messageSent = await sendFacebookMessage(
        conversation.userId,
        content,
        conversation.facebookPageId as string
      );
    }

    if (!messageSent) {
      // Delete the message if sending failed
      await prisma.message.delete({
        where: { id: botMessage.id }
      });
      return NextResponse.json(
        { error: 'Failed to send message to platform' },
        { status: 500 }
      );
    }

    // Broadcast message update
    await broadcastMessageUpdate(conversationId);

    // Get final updated conversation
    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    return NextResponse.json({
      message: botMessage,
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error('Error handling message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}