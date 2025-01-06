import { headers } from 'next/headers';
import { verifyToken } from './token';
import { TokenPayload } from './types';

// Get current tenant ID from request headers
export function getCurrentTenantId(): string | null {
  const headersList = headers();
  return headersList.get('x-tenant-id');
}

// Extract tenant info from JWT token
export async function getTenantFromToken(token: string): Promise<string | null> {
  try {
    const { payload } = await verifyToken(token);
    return payload?.tenantId || null;
  } catch {
    return null;
  }
}

// Verify tenant access
export function verifyTenantAccess(userTenantId: string | null, resourceTenantId: string | null): boolean {
  if (!userTenantId || !resourceTenantId) {
    return false;
  }
  return userTenantId === resourceTenantId;
}