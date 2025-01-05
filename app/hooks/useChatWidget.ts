import { useState, useEffect, useCallback } from 'react';
import { pusherClient, PUSHER_EVENTS} from '@/lib/pusher';
import { WidgetMessage } from '../types/widget';
import { Message } from '@prisma/client';

export function useChatWidget() {
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const ipResponse = await fetch('/api/chat/widget/ip');
        const { ip } = await ipResponse.json();
        localStorage.setItem('widget_user_ip', ip);

        const response = await fetch('/api/chat/widget/messages');
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        
        // Convert messages to WidgetMessage format
        const formattedMessages: WidgetMessage[] = data.conversations.flatMap((conv: any) => 
          conv.messages.map((msg: Message) => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
            status: 'DELIVERED',
            userId: conv.userId,
            ip: conv.chatId || ip
          }))
        );

        // Sort messages by timestamp
        setMessages(formattedMessages.sort((a: WidgetMessage, b: WidgetMessage) => 
          a.timestamp.getTime() - b.timestamp.getTime()
        ));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    fetchMessages();
  }, []);

  useEffect(() => {
    const channel = pusherClient.subscribe(`private-widget-chat`);

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind(PUSHER_EVENTS.MESSAGE_RECEIVED, (message: WidgetMessage) => {
      setMessages(prev => {
        const exists = prev.some(m => {
          if (m.id === message.id) return true;
          if (message.sender === 'USER' && m.id.startsWith('temp-') && m.content === message.content) return true;
          return false;
        });
        
        if (exists) return prev;

        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
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
    
    const userId = `widget-${userIp}`;

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
        body: JSON.stringify({ 
          content,
          userId,
          platform: 'WIDGET' 
        })
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