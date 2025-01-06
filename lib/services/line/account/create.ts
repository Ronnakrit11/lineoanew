import { PrismaClient } from '@prisma/client';
import { LineAccountCreateParams, LineAccountResult } from './types';
import { LineAccount } from '@/app/types/line';

const prisma = new PrismaClient();

export async function createLineAccount(params: LineAccountCreateParams): Promise<LineAccountResult> {
  try {
    const account = await prisma.lineAccount.create({
      data: {
        name: params.name,
        channelAccessToken: params.channelAccessToken,
        channelSecret: params.channelSecret,
        active: true
      },
      select: {
        id: true,
        name: true,
        channelSecret: true,
        channelAccessToken: true,
        active: true
      }
    });

    return {
      success: true,
      account: account as LineAccount
    };
  } catch (error) {
    console.error('Error creating LINE account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create LINE account'
    };
  }
}