"use client";

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  onClose: () => void;
  isConnected: boolean;
}

export function ChatHeader({ onClose, isConnected }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Chat Support</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-slate-300"
            )} />
            <p className="text-sm text-slate-500">
              {isConnected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}