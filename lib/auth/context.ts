import { headers } from 'next/headers';
import { TokenPayload } from './types';

// Store auth context in AsyncLocalStorage
const authContext = {
  getCurrentUser: (): TokenPayload | null => {
    const headersList = headers();
    const userJson = headersList.get('x-user-context');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as TokenPayload;
    } catch {
      return null;
    }
  },

  getCurrentTenantId: (): string | null => {
    const headersList = headers();
    return headersList.get('x-tenant-id');
  }
};

export default authContext;