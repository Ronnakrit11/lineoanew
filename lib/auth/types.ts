export interface TokenPayload {
  username: string;
  tenantId?: string;
}

export interface TokenVerificationResult {
  isValid: boolean;
  payload: TokenPayload | null;
}