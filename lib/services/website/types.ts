export interface WebsiteMessage {
    id: string;
    content: string;
    sender: 'USER' | 'BOT';
    timestamp: Date;
    conversationId: string;
  }
  
  export interface WebsiteConversation {
    id: string;
    userId: string;
    messages: WebsiteMessage[];
    createdAt: Date;
    updatedAt: Date;
  }