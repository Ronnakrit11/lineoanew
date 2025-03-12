"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { showToast } from '@/app/utils/toast';

interface Admin {
  id: string;
  username: string;
  role: string;
}

interface AssignConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  admins: Admin[];
  onAssign: () => void;
}

export function AssignConversationDialog({
  isOpen,
  onClose,
  conversationId,
  admins,
  onAssign
}: AssignConversationDialogProps) {
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminId) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          adminId: selectedAdminId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign conversation');
      }

      showToast.success('Conversation assigned successfully');
      onAssign();
      onClose();
    } catch (error) {
      showToast.error('Failed to assign conversation', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Conversation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Select Admin</Label>
            <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an admin" />
              </SelectTrigger>
              <SelectContent>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.username} ({admin.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedAdminId || isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}