import { prisma } from '@/lib/prisma';

export async function createWidgetConversation() {
  return prisma.conversation.create({
    data: {
      platform: 'WEBSITE',
      channelId: 'widget',
      userId: `widget-${Date.now()}`,
    }
  });
}

export async function findWidgetConversation(userId: string) {
  return prisma.conversation.findFirst({
    where: {
      userId,
      platform: 'WEBSITE',
      channelId: 'widget'
    },
    include: {
      messages: true
    }
  });
}