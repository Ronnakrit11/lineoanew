import React from 'react';
import { ConversationWithMessages } from '@/app/types/chat';
import { ScrollArea } from '../../ui/scroll-area';
import { ConversationPreview } from '../../ConversationPreview';
import { Separator } from '../../ui/separator';
import { EmptyState } from './EmptyState';

interface ConversationListContentProps {
  conversations: ConversationWithMessages[];
  selectedId?: string;
  onSelect: (conversation: ConversationWithMessages) => void;
  selectedAccountId: string | null;
}

export function ConversationListContent({
  conversations,
  selectedId,
  onSelect,
  selectedAccountId
}: ConversationListContentProps) {
  // Show empty state if no conversations match the current filter
  if (conversations.length === 0) {
    return <EmptyState selectedAccountId={selectedAccountId} />;
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y divide-slate-200">
        {conversations.filter(conv => conv.platform === 'LINE' || conv.platform === 'WIDGET').map((conversation) => (
          <React.Fragment key={conversation.id}>
            <ConversationPreview
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect(conversation)}
            />
            <Separator className="last:hidden" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}