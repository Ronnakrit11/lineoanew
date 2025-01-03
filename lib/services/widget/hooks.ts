import { useEffect } from 'react';
import { useWidgetStore } from './store';
import { useChatState } from '@/app/features/chat/useChatState';

export function useWidgetIntegration() {
  const { addMessage, conversationId } = useWidgetStore();
  const { refreshConversations } = useChatState();

  useEffect(() => {
    if (conversationId) {
      refreshConversations();
    }
  }, [conversationId, refreshConversations]);

  return { addMessage };
}