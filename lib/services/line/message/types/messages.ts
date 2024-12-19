import { Message } from '@line/bot-sdk';

export interface TextMessage {
  type: 'text';
  text: string;
}

export interface ImageMessage {
  type: 'image';
  contentProvider: {
    type: string;
    originalContentUrl?: string;
    previewImageUrl?: string;
  };
}

export type LineMessageType = TextMessage | ImageMessage;

export function isValidMessage(message: unknown): message is Message {
  if (!message || typeof message !== 'object') return false;
  
  const msg = message as Record<string, unknown>;
  if (!msg.type || typeof msg.type !== 'string') return false;
  
  switch (msg.type) {
    case 'text':
      return typeof msg.text === 'string';
    case 'image':
      return true;
    default:
      return false;
  }
}

export function createTextMessage(text: string): TextMessage {
  return {
    type: 'text',
    text: text.trim()
  };
}

export function createImageMessage(url: string): ImageMessage {
  return {
    type: 'image',
    contentProvider: {
      type: 'external',
      originalContentUrl: url,
      previewImageUrl: url
    }
  };
}