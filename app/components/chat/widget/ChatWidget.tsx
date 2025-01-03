"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatWidget } from '@/app/hooks/useChatWidget';
import { ChatMessage } from './ChatMessage';
import { ChatHeader } from '@/app/components/chat/widget/ChatHeader';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isConnected } = useChatWidget();

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