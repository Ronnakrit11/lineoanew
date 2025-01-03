import { create } from 'zustand';
import { WidgetMessage } from '@/app/types/chat/widget';

interface WidgetStore {
  messages: WidgetMessage[];
  conversationId: string | null;
  addMessage: (message: WidgetMessage) => void;
  setConversationId: (id: string) => void;
}

export const useWidgetStore = create<WidgetStore>((set) => ({
  messages: [],
  conversationId: null,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setConversationId: (id) => set({ conversationId: id })
}));