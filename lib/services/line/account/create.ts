import { PrismaClient } from '@prisma/client';
import { LineAccountCreateParams, LineAccountResult } from './types';
import { LineAccount } from '@/app/types/line';
import authContext from '@/lib/auth/context';

const prisma = new PrismaClient();

export async function createLineAccount(
  params: LineAccountCreateParams
): Promise<LineAccountResult> {
  try {
    const tenantId = authContext.getCurrentTenantId();
    
    if (!tenantId) {
      return {
        success: false,
        error: 'Tenant ID not found'
      };
    }

    const account = await prisma.lineAccount.create({
      data: {
        ...params,
        active: true,
        tenant: {
          connect: {
            id: tenantId
          }
        }
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