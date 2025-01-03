"use client";

import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils/dateFormatter';
import { WidgetMessage } from '@/app/types/widget';

interface ChatMessageProps {
  message: WidgetMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'USER';

  return (
    <div className={cn(
      "flex gap-2",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-2",
        isUser 
          ? "bg-primary text-white rounded-br-none" 
          : "bg-slate-100 text-slate-900 rounded-bl-none"
      )}>
        <p className="text-sm">{message.content}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-xs opacity-70">
            {formatTimestamp(message.timestamp)}
          </span>
          {isUser && (
            <div className="text-xs opacity-70">
              {message.status === 'DELIVERED' ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}