import { useState } from 'react';
import { useLineAccounts } from '@/app/hooks/useLineAccounts';
import { LineAccountSettingsDialog } from './LineAccountSettingsDialog';

export function LineAccountStatus() {
  const { accounts, isLoading } = useLineAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
        <div className="h-2 w-2 rounded-full bg-slate-200 animate-pulse" />
        <span className="text-xs text-slate-500">Loading accounts...</span>
      </div>
    );
  }

  if (!accounts.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      <button
        onClick={() => setSelectedAccountId(accounts[0]?.id || null)}
        className="text-xs text-slate-700 font-medium hover:text-slate-900 transition-colors"
      >
        {accounts.length} LINE {accounts.length === 1 ? 'Account' : 'Accounts'} Connected
      </button>

      <LineAccountSettingsDialog
        accountId={selectedAccountId}
        isOpen={selectedAccountId !== null}
        onClose={() => setSelectedAccountId(null)}
      />
    </div>
  );
}