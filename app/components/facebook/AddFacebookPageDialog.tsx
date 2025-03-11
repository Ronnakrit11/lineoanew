import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { showToast } from '@/app/utils/toast';

interface AddFacebookPageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFacebookPageDialog({ isOpen, onClose }: AddFacebookPageDialogProps) {
  const [pageId, setPageId] = useState('');
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/facebook/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          pageAccessToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add Facebook page');
      }

      showToast.success('Facebook page added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding Facebook page:', error);
      showToast.error('Failed to add Facebook page', {
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
          <DialogTitle>Add Facebook Page</DialogTitle>
          <DialogDescription>
            Connect your Facebook page to manage conversations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Page ID</Label>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder="Enter your Facebook page ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Page Access Token</Label>
            <input
              type="text"
              value={pageAccessToken}
              onChange={(e) => setPageAccessToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder="Enter your Facebook page access token"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Page'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}