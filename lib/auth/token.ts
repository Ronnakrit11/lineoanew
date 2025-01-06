import { jwtVerify, SignJWT } from 'jose';
import { TokenPayload, TokenVerificationResult } from './types';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function verifyToken(token: string): Promise<TokenVerificationResult> {
  try {
    const verified = await jwtVerify(token, secretKey);
    const payload = verified.payload;
    
    // Validate required fields
    if (typeof payload.username !== 'string') {
      return { isValid: false, payload: null };
    }

    // Convert to TokenPayload type
    const tokenPayload: TokenPayload = {
      username: payload.username,
      tenantId: typeof payload.tenantId === 'string' ? payload.tenantId : undefined
    };

    return { isValid: true, payload: tokenPayload };
  } catch (error) {
    return { isValid: false, payload: null };
  }
}

export async function createToken(payload: TokenPayload) {
  return new SignJWT({
    ...payload,
    tenantId: 'default' // Add default tenant ID
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey);
}