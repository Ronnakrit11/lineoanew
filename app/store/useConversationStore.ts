import { create } from 'zustand';
import { ConversationWithMessages } from '../types/chat';
import { Message } from '@prisma/client';

interface ConversationStore {
  conversations: ConversationWithMessages[];
  selectedConversation: ConversationWithMessages | null;
  setConversations: (conversations: ConversationWithMessages[]) => void;
  setSelectedConversation: (conversation: ConversationWithMessages | null) => void;
  updateConversation: (updatedConversation: ConversationWithMessages) => void;
  addMessage: (message: Message) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  selectedConversation: null,
  setConversations: (conversations) => set({ conversations }),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  updateConversation: (updatedConversation) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      );

      // Sort conversations by updatedAt timestamp
      const sortedConversations = updatedConversations.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );

      return {
        conversations: sortedConversations,
        selectedConversation:
          state.selectedConversation?.id === updatedConversation.id
            ? updatedConversation
            : state.selectedConversation,
      };
    }),
  addMessage: (message) =>
    set((state) => {
      const conversationToUpdate = state.conversations.find(
        (conv) => conv.id === message.conversationId
      );

      if (!conversationToUpdate) return state;

      const messageExists = conversationToUpdate.messages.some(
        (msg) => msg.id === message.id
      );

      if (messageExists) return state;

      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === message.conversationId) {
          const updatedMessages = [...conv.messages, message].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
          );
          return {
            ...conv,
            messages: updatedMessages,
            updatedAt: message.timestamp
          };
        }
        return conv;
      });

      // Sort conversations by updatedAt timestamp
      const sortedConversations = updatedConversations.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );

      const updatedSelectedConversation = 
        state.selectedConversation?.id === message.conversationId
          ? {
              ...state.selectedConversation,
              messages: [...state.selectedConversation.messages, message].sort(
                (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
              ),
              updatedAt: message.timestamp
            }
          : state.selectedConversation;

      return {
        conversations: sortedConversations,
        selectedConversation: updatedSelectedConversation,
      };
    }),
}));