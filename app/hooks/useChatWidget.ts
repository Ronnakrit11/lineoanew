import { useState, useEffect, useCallback } from 'react';
import { pusherClient, PUSHER_EVENTS} from '@/lib/pusher';
import { WidgetMessage } from '../types/widget';

export function useChatWidget() {
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Load initial messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        // Get user IP first
        const ipResponse = await fetch('/api/chat/widget/ip');
        const { ip } = await ipResponse.json();
        localStorage.setItem('widget_user_ip', ip);
        const userId = `widget-user-${ip}`;

        // Then fetch messages
        const response = await fetch('/api/chat/widget/messages');
        if (!response.ok) throw new Error('Failed to fetch messages');
        const { conversations } = await response.json();
        
        // Find user's conversation
        const userConversation = conversations.find(
          (conv: any) => conv.userId === userId
        );
        
        // Set messages from user's conversation
        const userMessages = userConversation?.messages || [];
        setMessages(userMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
    fetchMessages();
  }, []);

  useEffect(() => {
    // Subscribe to private channel
    const channel = pusherClient.subscribe(`private-widget-chat`);

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind(PUSHER_EVENTS.MESSAGE_RECEIVED, (message: WidgetMessage) => {
      // Deduplicate messages by ID
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id || 
          (m.id.startsWith('temp-') && m.content === message.content));
        if (exists) return prev;
        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }];
      });
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error:', error);
      setIsConnected(false);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-widget-chat`);
    };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // Get or fetch client IP
    let userIp: string;
    const storedIp = localStorage.getItem('widget_user_ip');
    
    if (!storedIp) {
      const response = await fetch('/api/chat/widget/ip');
      const data = await response.json();
      userIp = data.ip;
      localStorage.setItem('widget_user_ip', userIp);
    } else {
      userIp = storedIp;
    }
    
    const userId = `widget-user-${userIp}`;

    const tempMessage: WidgetMessage = {
      id: `temp-${Date.now()}`,
      content,
      sender: 'USER',
      timestamp: new Date(),
      status: 'SENT',
      userId,
      ip: userIp
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch('/api/chat/widget/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Update message status to delivered
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'DELIVERED' as const }
          : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error state for failed message
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'ERROR' as const }
          : msg
      ));
    }
  }, []);

  return {
    messages,
    sendMessage,
    isConnected
  };
}