export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'ERROR';
export type MessageSender = 'USER' | 'ADMIN';

export interface WidgetMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: Date;
  status?: MessageStatus;
}

export interface WidgetUser {
  id: string;
  name?: string;
  email?: string;
  isOnline: boolean;
}