// Remove unused import
import { verifyToken } from './token';

export async function getTenantFromToken(token: string) {
  const { isValid } = await verifyToken(token);
  return isValid;
}