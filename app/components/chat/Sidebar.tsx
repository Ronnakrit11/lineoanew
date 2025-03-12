import React from 'react';
import { ConversationWithMessages } from '@/app/types/chat';
import ConversationList from '../ConversationList';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarHeader } from '../sidebar/SidebarHeader';
import { SidebarOverlay } from '../sidebar/SidebarOverlay';

interface SidebarProps {
  isOpen: boolean;
  conversations: ConversationWithMessages[];
  selectedId?: string;
  onSelect: (conversation: ConversationWithMessages) => void;
  onClose: () => void;
  onDashboardClick: () => void;
  onLineSettingsClick: () => void;
  onAdminClick: () => void; // Add new prop
  showDashboard: boolean;
  showLineSettings: boolean;
  showAdmin: boolean; // Add new prop
}

export function Sidebar({ 
  isOpen, 
  conversations, 
  selectedId, 
  onSelect,
  onClose,
  onDashboardClick,
  onLineSettingsClick,
  onAdminClick, // Add new prop
  showDashboard,
  showLineSettings,
  showAdmin // Add new prop
}: SidebarProps) {
  const showSidebar = isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024);

  return (
    <>
      <AnimatePresence>
        {isOpen && <SidebarOverlay onClick={onClose} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={cn(
              "fixed inset-y-0 left-0 lg:static",
              "w-[280px] sm:w-[320px] lg:w-80",
              "bg-white border-r border-slate-200",
              "z-40 lg:z-0",
              "flex flex-col pt-1 lg:pt-0",
              "shadow-lg lg:shadow-none" 
            )}
          >
            <SidebarHeader 
              onClose={onClose}
              onDashboardClick={onDashboardClick}
              onLineSettingsClick={onLineSettingsClick}
              onAdminClick={onAdminClick} // Add new prop
              showDashboard={showDashboard}
              showLineSettings={showLineSettings}
              showAdmin={showAdmin} // Add new prop
            />

            <ConversationList 
              conversations={conversations}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}