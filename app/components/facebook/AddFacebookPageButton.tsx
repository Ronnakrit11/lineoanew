import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddFacebookPageDialog } from './AddFacebookPageDialog';
export function AddFacebookPageButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Facebook Page</span>
      </button>

      <AddFacebookPageDialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}