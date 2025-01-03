import { useState, useEffect, useCallback } from 'react';
import { pusherClient, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { WidgetMessage } from '../types/widget';

export function useChatWidget() {
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to private channel
    const channel = pusherClient.subscribe(`private-widget-chat`);
    console.log('Subscribing to widget channel');

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
      console.log('Successfully subscribed to channel');
    });

    channel.bind(PUSHER_EVENTS.MESSAGE_RECEIVED, (message: WidgetMessage) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp)
      }]);
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
    const tempMessage: WidgetMessage = {
      id: `temp-${Date.now()}`,
      content,
      sender: 'USER',
      timestamp: new Date(),
      status: 'SENT'
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