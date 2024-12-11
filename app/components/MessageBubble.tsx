"use client";

import React from 'react';
import { Message } from '@prisma/client';
import { formatTimestamp } from '../utils/dateFormatter';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';
import { ProfileAvatar } from './ProfileAvatar';
import { useChatState } from '../features/chat/useChatState';
import { getBotName, getBotAvatar } from '@/lib/utils/botUtils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { conversations } = useChatState();
  const conversation = conversations.find(conv => conv.id === message.conversationId);
  const isUser = message.sender === 'USER';
  const isTempMessage = message.id.startsWith('temp-');
  const displayAsUser = isUser && !isTempMessage;

  return (
    <div className={cn(
      "flex items-end gap-2 group",
      displayAsUser ? "flex-row-reverse" : "flex-row"
    )}>
      {displayAsUser ? (
        <ProfileAvatar 
          userId={conversation?.userId || ''} 
          platform={message.platform}
        />
      ) : (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={cn(
            "text-sm font-medium",
            message.platform === 'LINE' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted/10 text-muted"
          )}>
            {getBotAvatar(message)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[70%] space-y-1",
        displayAsUser ? "items-end" : "items-start"
      )}>
        {!displayAsUser && (
          <div className="px-2 text-xs text-muted">
            {getBotName(message)}
          </div>
        )}
        <div className={cn(
          "px-4 py-2.5 text-sm rounded-2xl",
          displayAsUser 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-slate-800 text-white rounded-bl-none",
          isTempMessage && "opacity-70"
        )}>
          {message.content}
        </div>
        <div className={cn(
          "px-2 text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity",
          displayAsUser ? "text-right" : "text-left"
        )}>
          {formatTimestamp(message.timestamp)}
          {message.chatType && (
            <span className="ml-2 opacity-60">
              via {message.chatType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}