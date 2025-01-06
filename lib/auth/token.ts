import { jwtVerify, SignJWT } from 'jose';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function verifyToken(token: string) {
  try {
    await jwtVerify(token, secretKey);
    return { isValid: true, payload: null };
  } catch (error) {
    return { isValid: false, payload: null };
  }
}

export async function createToken(payload: { username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey);
}