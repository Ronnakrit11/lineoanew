import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function sendFacebookMessage(
  userId: string,
  content: string,
  facebookPageId: string
): Promise<boolean> {
  try {
    // Get Facebook page details
    const page = await prisma.facebookPage.findUnique({
      where: { id: facebookPageId }
    });

    if (!page) {
      throw new Error('Facebook page not found');
    }

    // Send message using Facebook Graph API
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        recipient: { id: userId },
        message: { text: content }
      },
      {
        params: {
          access_token: page.accessToken
        }
      }
    );

    return true;
  } catch (error) {
    console.error('Error sending Facebook message:', error);
    return false;
  }
}