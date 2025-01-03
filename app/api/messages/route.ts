import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendLineMessage } from '@/lib/services/line/message/send';
import { sendFacebookMessage } from '@/lib/facebookClient';
import { pusherServer, PUSHER_EVENTS } from '@/lib/pusher';
import { broadcastMessageUpdate } from '@/lib/messageService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, content, platform } = body;

    console.log('Received message request:', { conversationId, content, platform });

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
      console.error('Conversation not found:', conversationId);
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Create bot message
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
      // Broadcast to widget channel
      await pusherServer.trigger(
        'private-widget-chat',
        PUSHER_EVENTS.MESSAGE_RECEIVED,
        {
          id: botMessage.id,
          content: botMessage.content,
          sender: botMessage.sender,
          timestamp: botMessage.timestamp,
          status: 'DELIVERED'
        }
      );
    }

    console.log('Created bot message:', botMessage);

    // Send to platform
    let messageSent = false;
    if (platform === 'LINE' && conversation.channelId !== 'widget') {
      console.log('Sending LINE message:', {
        userId: conversation.userId,
        lineAccountId: conversation.lineAccountId
      });
      
      const result = await sendLineMessage(
        conversation.userId,
        content,
        conversation.lineAccountId
      );
      messageSent = result.success;
      if (!messageSent && result.error) {
        console.error('LINE message send error:', result.error);
      }
    } else if (platform === 'FACEBOOK') {
      console.log('Sending Facebook message to:', conversation.userId);
      messageSent = await sendFacebookMessage(conversation.userId, content);
    }

    if (!messageSent) {
      console.error('Failed to send message to platform:', platform);
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

    console.log('Message sent successfully');
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