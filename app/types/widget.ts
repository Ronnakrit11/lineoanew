export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'ERROR';
export type MessageSender = 'USER' | 'BOT' | 'ADMIN';

export interface WidgetUser {
  id: string;
  ip: string;
  name?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface WidgetMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: Date;
  status?: MessageStatus;
  userId: string;
  ip: string;
  platform?: string;
}

export interface WidgetUser {
  id: string;
  name?: string;
  email?: string;
  isOnline: boolean;
}