import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { PUSHER_EVENTS, PUSHER_CHANNELS } from '@/app/config/constants';
import { formatMessageForPusher } from '@/lib/messageFormatter';

export async function broadcastWebsiteMessage(conversationId: string) {
  try {
    // Get conversation with latest message
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    if (!conversation || !conversation.messages.length) {
      return false;
    }

    const latestMessage = conversation.messages[0];

    // Broadcast updates
    await Promise.all([
      // Broadcast message
      pusherServer.trigger(
        PUSHER_CHANNELS.CHAT,
        PUSHER_EVENTS.MESSAGE_RECEIVED,
        formatMessageForPusher(latestMessage)
      ),
      // Broadcast conversation update
      pusherServer.trigger(
        PUSHER_CHANNELS.CHAT,
        PUSHER_EVENTS.CONVERSATION_UPDATED,
        {
          ...conversation,
          updatedAt: conversation.updatedAt.toISOString(),
          messages: conversation.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }))
        }
      ),
      // Broadcast conversations list update
      pusherServer.trigger(
        PUSHER_CHANNELS.CHAT,
        PUSHER_EVENTS.CONVERSATIONS_UPDATED,
        { timestamp: new Date().toISOString() }
      )
    ]);

    return true;
  } catch (error) {
    console.error('Error broadcasting website message:', error);
    return false;
  }
}