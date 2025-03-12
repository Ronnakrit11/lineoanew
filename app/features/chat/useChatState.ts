import { create } from 'zustand';
import { ConversationWithMessages } from '../../types/chat';
import { Message } from '@prisma/client';

interface ChatState {
  conversations: ConversationWithMessages[];
  selectedConversation: ConversationWithMessages | null;
  setConversations: (conversations: ConversationWithMessages[]) => void;
  setSelectedConversation: (conversation: ConversationWithMessages | null) => void;
  updateConversation: (updatedConversation: ConversationWithMessages) => void;
  addMessage: (message: Message) => void;
  refreshConversations: () => Promise<void>;
}

export const useChatState = create<ChatState>((set, get) => ({
  conversations: [],
  selectedConversation: null,

  setConversations: async (conversations) => {
    try {
      // Fetch admin role and assignments
      const response = await fetch('/api/auth/me');
      const admin = await response.json();

      if (admin.role === 'SUPER_ADMIN') {
        // Super admin sees all conversations
        set({ 
          conversations: sortConversations(conversations.filter(conv => conv)),
          selectedConversation: null 
        });
      } else {
        // Regular admin only sees assigned conversations
        const assignedResponse = await fetch('/api/admin/conversations');
        const assignedConversations = await assignedResponse.json();
        const assignedIds = new Set(assignedConversations.map((c: any) => c.id));

        const filteredConversations = conversations.filter(conv => 
          assignedIds.has(conv.id)
        );

        set({ 
          conversations: sortConversations(filteredConversations),
          selectedConversation: null 
        });
      }
    } catch (error) {
      console.error('Error filtering conversations:', error);
      // Fallback to showing no conversations on error
      set({ conversations: [], selectedConversation: null });
    }
  },

  setSelectedConversation: (conversation) => 
    set({ selectedConversation: conversation }),

  updateConversation: (updatedConversation) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      );

      // Always sort conversations after update
      const sortedConversations = sortConversations(updatedConversations);

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

      // Create updated conversation with new message
      const updatedConversation = {
        ...conversationToUpdate,
        messages: sortMessages([...conversationToUpdate.messages, message]),
        updatedAt: message.timestamp
      };

      // Update conversations array
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === message.conversationId ? updatedConversation : conv
      );

      // Sort conversations by latest message
      const sortedConversations = sortConversations(updatedConversations);

      return {
        conversations: sortedConversations,
        selectedConversation:
          state.selectedConversation?.id === message.conversationId
            ? updatedConversation
            : state.selectedConversation,
      };
    }),

  refreshConversations: async () => {
    try {
      const response = await fetch('/api/webhooks/conversations', {
        headers: {
          'Authorization': `Bearer ${process.env.API_SECRET_KEY}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const conversations = await response.json();

      const formattedConversations = conversations.map((conv: any) => ({
        ...conv,
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt)
      }));

      // Use setConversations to apply admin filtering
      get().setConversations(formattedConversations);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  }
}));

function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

function sortConversations(conversations: ConversationWithMessages[]): ConversationWithMessages[] {
  return [...conversations].sort((a, b) => {
    // Get latest message timestamp for each conversation
    const aLatest = a.messages.length > 0 ? 
      new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 
      new Date(a.updatedAt).getTime();
    
    const bLatest = b.messages.length > 0 ? 
      new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 
      new Date(b.updatedAt).getTime();

    // Sort by latest message/update time
    return bLatest - aLatest;
  });
}