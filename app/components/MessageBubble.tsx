import React, { useState } from 'react';
import { Message } from '@prisma/client';
import { Image, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ProfileAvatar } from './ProfileAvatar';
import { MessageActions } from './chat/MessageActions';
import { useChatState } from '../features/chat/useChatState';
import { formatTimestamp } from '../utils/dateFormatter';
import { isImageContent, extractImageUrl } from '@/lib/services/line/image/content';
import { cn } from '@/lib/utils';
import { AssignConversationDialog } from './admin/AssignConversationDialog';
import { Button } from './ui/button';

interface MessageBubbleProps {
  message: Message;
  userId?: string;
}

export function MessageBubble({ message, userId }: MessageBubbleProps) {
  const { conversations } = useChatState();
  const conversation = conversations.find(conv => conv.id === message.conversationId);
  const isUser = message.sender === 'USER';
  const isTempMessage = message.id.startsWith('temp-');
  const displayAsUser = isUser && !isTempMessage;
  const isImage = isImageContent(message.content);
  const imageUrl = isImage ? extractImageUrl(message.content) : null;

  // State for admin assignment
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [admins, setAdmins] = useState<Array<{ id: string; username: string; role: string }>>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if current user is super admin
  React.useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setIsSuperAdmin(data.role === 'SUPER_ADMIN');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };
    checkAdminRole();
  }, []);

  // Fetch admins when assign dialog opens
  const handleAssignClick = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
        setIsAssignDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleAssignSuccess = () => {
    // Refresh conversations or update UI as needed
    setIsAssignDialogOpen(false);
  };

  return (
    <div className={cn(
      "flex items-end gap-2 group relative px-2 sm:px-4 lg:px-8",
      displayAsUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar Section */}
      {displayAsUser ? (
        <ProfileAvatar 
          userId={userId || conversation?.userId || ''} 
          platform={message.platform}
        />
      ) : (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-muted/10 text-muted">
            B
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Message Content Section */}
      <div className={cn(
        "max-w-[70%] space-y-1",
        displayAsUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl",
          displayAsUser 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-slate-800 text-white rounded-bl-none",
          isTempMessage && "opacity-70",
          isImage ? "p-1" : "px-4 py-2.5"
        )}>
          {isImage && imageUrl ? (
            <div className="relative">
              <img 
                src={imageUrl}
                alt="Sent image"
                className="max-w-full rounded-lg max-h-[300px] object-contain"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1">
                <Image className="w-4 h-4 text-white" />
              </div>
            </div>
          ) : (
            <span className="text-sm flex items-center gap-2">
              {message.content}
            </span>
          )}
        </div>

        {/* Timestamp */}
        <div className={cn(
          "px-2 text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity",
          displayAsUser ? "text-right" : "text-left"
        )}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>

      {/* Message Actions */}
      <div className="flex items-center gap-2">
        <MessageActions message={message} />
        {/* Admin Assignment Button - Only show for SUPER_ADMIN */}
        {isSuperAdmin && displayAsUser && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAssignClick}
          >
            <UserPlus className="h-4 w-4 text-slate-500" />
          </Button>
        )}
      </div>

      {/* Admin Assignment Dialog */}
      <AssignConversationDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        conversationId={message.conversationId}
        admins={admins}
        onAssign={handleAssignSuccess}
      />
    </div>
  );
}