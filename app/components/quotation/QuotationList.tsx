"use client";

import { Search } from 'lucide-react';
import { useLineAccounts } from '@/app/hooks/useLineAccounts';
import { QuotationSection } from './QuotationSection';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { useState } from 'react';

export function QuotationList() {
  const { accounts, isLoading } = useLineAccounts();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return <QuotationListSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 sm:p-6 flex-shrink-0">
        <div className="relative max-w-md w-full mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="ค้นหาใบเสนอราคา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 sm:px-6 pb-6 space-y-6">
          {accounts.map((account) => (
            <QuotationSection 
              key={account.id} 
              account={account}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function QuotationListSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="max-w-md mx-auto">
        <div className="h-10 bg-slate-100 rounded animate-pulse" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 bg-slate-100 rounded w-48 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-16 bg-slate-50 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}