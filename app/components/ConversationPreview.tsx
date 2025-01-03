import React from 'react';
import { ConversationWithMessages } from '../types/chat';
import { formatThaiDateTime } from '@/lib/utils/dateFormatter';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { useLineProfile } from '../hooks/useLineProfile';
import { LineAccountInfo } from './conversation/LineAccountInfo';
import { motion } from 'framer-motion';
import { useConversationUpdates } from '../hooks/useConversationUpdates';

interface ConversationPreviewProps {
  conversation: ConversationWithMessages;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationPreview({
  conversation,
  isSelected,
  onClick,
}: ConversationPreviewProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const { profile, isLoading: isProfileLoading } = useLineProfile(
    conversation.platform === 'LINE' ? conversation.userId : null
  );
  
  // Use the conversation updates hook
  useConversationUpdates();

  const getLastMessagePreview = () => {
    if (!lastMessage) return '';
    
    const prefix = lastMessage.sender === 'USER' ? 'User: ' : 'Bot: ';
    return (
      <p className="text-sm text-slate-600 truncate mt-1">
        <span className={cn(
          "font-medium",
          lastMessage.sender === 'USER' ? "text-primary/80" : "text-slate-500"
        )}>
          {prefix}
        </span>
        {lastMessage.content}
      </p>
    );
  };

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 hover:bg-slate-50 cursor-pointer transition-all duration-200",
        "min-h-[4.5rem] flex items-center group",
        isSelected && "bg-primary/5 hover:bg-primary/5"
      )}
    >
      {/* Rest of the component remains the same */}
      <div className="flex gap-3 w-full min-w-0">
        <Avatar className={cn(
          "h-10 w-10 flex-shrink-0 ring-2 ring-transparent transition-all duration-200",
          isSelected && "ring-primary/20"
        )}>
          {profile?.pictureUrl ? (
            <AvatarImage src={profile.pictureUrl} alt={profile.displayName} />
          ) : (
            <AvatarFallback className={cn(
              "text-base font-medium transition-colors duration-200",
              isSelected 
                ? "bg-primary text-primary-foreground" 
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
            )}>
              {conversation.platform === 'LINE' ? 'L' : 'F'}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className={cn(
                "font-medium leading-none truncate transition-colors duration-200",
                isSelected ? "text-primary" : "text-slate-900"
              )}>
                {isProfileLoading ? (
                  <span className="animate-pulse bg-slate-200 rounded h-4 w-24 inline-block" />
                ) : (
                  profile?.displayName || `${conversation.platform} User`
                )}
              </h3>
              {conversation.platform === 'LINE' && conversation.lineAccountId && (
                <LineAccountInfo 
                  accountId={conversation.lineAccountId} 
                  className="mt-1"
                />
              )}
              <p className="text-xs text-slate-500 mt-1 truncate">
                {profile?.statusMessage || `ID: ${conversation.userId.slice(0, 8)}...`}
              </p>
            </div>
            {lastMessage && (
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {formatThaiDateTime(lastMessage.timestamp)}
              </span>
            )}
          </div>
          
          {getLastMessagePreview()}
        </div>
      </div>
    </motion.div>
  );
}