export interface WidgetMessage {
    id: string;
    content: string;
    sender: 'user' | 'admin';
    timestamp: Date;
  }
  
  export interface WidgetConversation {
    id: string;
    messages: WidgetMessage[];
  }