"use client";

import React, { useRef, useState } from 'react';
import { SerializedConversation } from '../types/chat';
import { DashboardMetrics } from '../types/dashboard';
import { MessageListWithRef, MessageListHandle } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '../features/chat/useChat';
import { Separator } from './ui/separator';
import { TypingIndicator } from './TypingIndicator';
import { Message, Platform, SenderType } from '@prisma/client';
import { Header } from './layout/Header';
import { Sidebar } from './chat/Sidebar';
import { ChatHeader } from './chat/ChatHeader';
import { LineAccountStatus } from './line-account/LineAccountStatus';
import { MetricsContainer } from './dashboard/metrics/MetricsContainer';

interface ChatInterfaceProps {
  initialConversations: SerializedConversation[];
  metrics: DashboardMetrics;
}

export function ChatInterface({ initialConversations, metrics }: ChatInterfaceProps) {
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
  } = useChat(initialConversations);

  const messageListRef = useRef<MessageListHandle>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);

  const handleSendMessage = async (content: string) => {
    if (selectedConversation) {
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: selectedConversation.id,
        content,
        sender: 'USER' as SenderType,
        timestamp: new Date(),
        platform: selectedConversation.platform as Platform,
        externalId: null,
        chatType: null,
        chatId: null,
        imageBase64: null
      };

      messageListRef.current?.addLocalMessage(tempMessage);
      await sendMessage(content);
    }
  };

  const handleConversationSelect = (conversation: typeof selectedConversation) => {
    setSelectedConversation(conversation);
    setShowDashboard(false);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleDashboardClick = () => {
    setSelectedConversation(null);
    setShowDashboard(true);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        toggleSidebar={toggleSidebar} 
        title="Chat Dashboard" 
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={handleConversationSelect}
          onClose={closeSidebar}
          onDashboardClick={handleDashboardClick}
        />

        <Separator orientation="vertical" className="hidden lg:block" />

        <main className="flex-1 flex flex-col min-w-0 bg-white relative">
          {selectedConversation ? (
            <>
              <ChatHeader
                platform={selectedConversation.platform}
                userId={selectedConversation.userId}
              />

              <MessageListWithRef 
                ref={messageListRef}
                conversationId={selectedConversation.id}
                userId={selectedConversation.userId}
              />
              <TypingIndicator conversationId={selectedConversation.id} />
              <MessageInput 
                onSend={handleSendMessage}
                conversationId={selectedConversation.id}
              />
            </>
          ) : showDashboard ? (
            <div className="flex-1 flex flex-col bg-slate-50 overflow-auto">
              <MetricsContainer metrics={metrics} />
            </div>
          ) : null}
        </main>
      </div>

      <LineAccountStatus />
    </div>
  );
}