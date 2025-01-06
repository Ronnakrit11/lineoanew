import { UserRole } from '@prisma/client';

// JWT payload type that extends jose's JWTPayload
export interface JWTPayload extends Record<string, unknown> {
  username: string;
  tenantId: string | null;
  role: UserRole;
}

export interface TokenPayload {
  username: string;
  tenantId: string | null;
  role: UserRole;
}

export interface TokenVerificationResult {
  isValid: boolean;
  payload: TokenPayload | null;
}