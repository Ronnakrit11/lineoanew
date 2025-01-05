"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pusherClient, PUSHER_EVENTS } from '@/lib/pusher';
import { WidgetMessage } from '@/app/types/widget';
import { ChatMessage } from './ChatMessage';
import { ChatHeader } from '@/app/components/chat/widget/ChatHeader';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userIp, setUserIp] = useState<string | null>(null);

  // Initialize chat and fetch messages
  useEffect(() => {
    async function initializeChat() {
      try {
        // Get client IP
        const ipResponse = await fetch('/api/chat/widget/ip');
        const { ip } = await ipResponse.json();
        setUserIp(ip);
        localStorage.setItem('widget_user_ip', ip);

        // Fetch existing messages
        const response = await fetch('/api/chat/widget/messages');
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        
        // Format and sort messages
        const formattedMessages = data.conversations.flatMap((conv: any) => 
          conv.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
            status: 'DELIVERED',
            userId: conv.userId,
            ip: conv.chatId || ip
          }))
        ).sort((a: WidgetMessage, b: WidgetMessage) => 
          a.timestamp.getTime() - b.timestamp.getTime()
        );

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    }

    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  // Set up Pusher subscription
  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to both channels for complete message coverage
    const widgetChannel = pusherClient.subscribe(`private-widget-chat`);
    const chatChannel = pusherClient.subscribe('private-chat');

    widgetChannel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    const handleNewMessage = (message: WidgetMessage) => {
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(m => 
          m.id === message.id || 
          (message.sender === 'USER' && m.id.startsWith('temp-') && m.content === message.content)
        );
        
        if (exists) return prev;

        // Add new message and sort
        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
    };

    // Listen for messages on both channels
    widgetChannel.bind(PUSHER_EVENTS.MESSAGE_RECEIVED, handleNewMessage);
    chatChannel.bind(PUSHER_EVENTS.MESSAGE_RECEIVED, handleNewMessage);

    return () => {
      widgetChannel.unbind_all();
      chatChannel.unbind_all();
      pusherClient.unsubscribe('private-widget-chat');
      pusherClient.unsubscribe('private-chat');
    };
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!userIp || !content.trim()) return;

    const userId = `widget-${userIp}`;
    const tempId = `temp-${Date.now()}`;

    // Add temporary message
    const tempMessage: WidgetMessage = {
      id: tempId,
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

      // Update temp message status
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: 'DELIVERED' as const }
          : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error state for failed message
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: 'ERROR' as const }
          : msg
      ));
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute bottom-16 right-0",
              "w-[360px] h-[600px] bg-white rounded-lg shadow-xl",
              "flex flex-col overflow-hidden border border-slate-200"
            )}
          >
            <ChatHeader onClose={() => setIsOpen(false)} isConnected={isConnected} />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className={cn(
                    "flex-1 resize-none p-2 rounded-lg",
                    "border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary",
                    "min-h-[44px] max-h-[120px]"
                  )}
                  rows={1}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      "bg-primary text-white",
                      "hover:bg-primary/90 disabled:opacity-50"
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-colors",
          "bg-primary text-white hover:bg-primary/90",
          "flex items-center justify-center"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}