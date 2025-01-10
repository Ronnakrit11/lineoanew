import { Platform } from '@prisma/client';

export interface LineMessageContent {
  type: string;
  text?: string;
  id: string;
  quoteToken?: string;
}

export interface LineSource {
  type: string;
  userId: string;
  roomId?: string;
  groupId?: string;
}

export interface LineMessageEvent {
  type: string;
  message: LineMessageContent;
  source: LineSource;
  replyToken: string;
  timestamp: number;
  webhookEventId: string;
  deliveryContext: {
    isRedelivery: boolean;
  };
  mode: string;
}

export interface LineWebhookBody {
  destination: string;
  events: LineMessageEvent[];
}

// Account types
export interface LineAccount {
  id: string;
  name: string;
 
  imageUrl?: string | null;
  companyName?: string | null;
  channelSecret: string;
  channelAccessToken: string;
  active: boolean;
}

export interface SignatureVerificationResult {
  account: LineAccount;
  isValid: boolean;
}

// Profile types
export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  platform: Platform;
}

// API Response types
export interface LineApiResponse {
  messageId: string;
}

// Webhook types
export interface LineWebhookEventResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface LineWebhookProcessingResult {
  processed: number;
  total: number;
  results: LineWebhookEventResult[];
}