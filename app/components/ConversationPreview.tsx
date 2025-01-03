import { cn } from '@/lib/utils';
import { ConversationWithMessages } from '../types/chat';
import { formatThaiDateTime } from '@/lib/utils/dateFormatter';
import { Avatar, AvatarFallback } from './ui/avatar';
import { LineAccountInfo } from './conversation/LineAccountInfo';

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
  const isWebsite = conversation.platform === 'WEBSITE';

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 hover:bg-slate-50 cursor-pointer transition-all duration-200",
        "min-h-[4.5rem] flex items-center group",
        isSelected && "bg-primary/5 hover:bg-primary/5"
      )}
    >
      <div className="flex gap-3 w-full min-w-0">
        <Avatar className={cn(
          "h-10 w-10 flex-shrink-0 ring-2 ring-transparent transition-all duration-200",
          isSelected && "ring-primary/20"
        )}>
          <AvatarFallback className={cn(
            "text-base font-medium transition-colors duration-200",
            isSelected 
              ? "bg-primary text-primary-foreground" 
              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
          )}>
            {isWebsite ? 'W' : conversation.platform === 'LINE' ? 'L' : 'F'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className={cn(
                "font-medium leading-none truncate transition-colors duration-200",
                isSelected ? "text-primary" : "text-slate-900"
              )}>
                {isWebsite ? 'Website Visitor' : `${conversation.platform} User`}
              </h3>
              {conversation.platform === 'LINE' && conversation.lineAccountId && (
                <LineAccountInfo 
                  accountId={conversation.lineAccountId} 
                  className="mt-1"
                />
              )}
              <p className="text-xs text-slate-500 mt-1 truncate">
                ID: {conversation.userId}
              </p>
            </div>
            {lastMessage && (
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {formatThaiDateTime(lastMessage.timestamp)}
              </span>
            )}
          </div>
          
          {lastMessage && (
            <p className="text-sm text-slate-600 truncate mt-1">
              <span className={cn(
                "font-medium",
                lastMessage.sender === 'USER' ? "text-primary/80" : "text-slate-500"
              )}>
                {lastMessage.sender === 'USER' ? 'User: ' : 'Bot: '}
              </span>
              {lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}