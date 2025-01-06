import { jwtVerify, SignJWT } from 'jose';
import { TokenPayload, TokenVerificationResult, JWTPayload } from './types';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function verifyToken(token: string): Promise<TokenVerificationResult> {
  try {
    const verified = await jwtVerify(token, secretKey);
    const jwtPayload = verified.payload as JWTPayload;
    
    // Convert JWT payload to TokenPayload
    const tokenPayload: TokenPayload = {
      username: jwtPayload.username,
      tenantId: jwtPayload.tenantId,
      role: jwtPayload.role
    };

    return { 
      isValid: true, 
      payload: tokenPayload
    };
  } catch (error) {
    return { 
      isValid: false, 
      payload: null 
    };
  }
}

export async function createToken(payload: TokenPayload): Promise<string> {
  // Convert TokenPayload to JWTPayload
  const jwtPayload: JWTPayload = {
    ...payload,
    [Symbol.iterator]: undefined // Add required index signature
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey);
}