import { PrismaClient } from '@prisma/client';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { formatConversationForPusher } from '@/lib/messageFormatter';

const prisma = new PrismaClient();

export async function handleFacebookMessage(
  userId: string,
  pageId: string,
  messageText: string,
  timestamp = new Date()
) {
  try {
    // Find the Facebook page
    const page = await prisma.facebookPage.findFirst({
      where: { pageId, active: true }
    });

    if (!page) {
      throw new Error('Facebook page not found');
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId,
        platform: 'FACEBOOK',
        facebookPageId: page.id
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          platform: 'FACEBOOK',
          channelId: `${pageId}_${userId}`,
          facebookPageId: page.id
        },
        include: {
          messages: true
        }
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        sender: 'USER',
        platform: 'FACEBOOK',
        timestamp
      }
    });

    // Get updated conversation
    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (updatedConversation) {
      // Broadcast updates
      await Promise.all([
        // Broadcast message
        pusherServer.trigger(
          `private-conversation-${conversation.id}`,
          PUSHER_EVENTS.MESSAGE_RECEIVED,
          {
            ...message,
            timestamp: message.timestamp.toISOString()
          }
        ),

        // Broadcast conversation update
        pusherServer.trigger(
          PUSHER_CHANNELS.CHAT,
          PUSHER_EVENTS.CONVERSATION_UPDATED,
          formatConversationForPusher(updatedConversation)
        )
      ]);
    }

    return { message, conversation: updatedConversation };
  } catch (error) {
    console.error('Error handling Facebook message:', error);
    throw error;
  }
}