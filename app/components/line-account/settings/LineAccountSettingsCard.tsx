import { LineAccount } from '@/app/types/line';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Settings, Key } from 'lucide-react';
import { useState } from 'react';
import { LineAccountSettingsDialog } from './LineAccountSettingsDialog';
import { cn } from '@/lib/utils';

interface LineAccountSettingsCardProps {
  account: LineAccount;
  onUpdate: () => void;
}

export function LineAccountSettingsCard({ account, onUpdate }: LineAccountSettingsCardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Account Info Section */}
          <div className="flex items-start gap-6 flex-1 min-w-0">
            {/* Account Image */}
            <div className="relative flex-shrink-0">
              {account.imageUrl ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden">
                  <img 
                    src={account.imageUrl} 
                    alt={account.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={cn(
                  "w-24 h-24 rounded-lg flex items-center justify-center",
                  "bg-slate-100 text-slate-400 text-2xl font-medium"
                )}>
                  {account.name.charAt(0)}
                </div>
              )}
              <Badge 
                variant={account.active ? "success" : "secondary"}
                className="absolute -top-2 -right-2"
              >
                {account.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Account Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold text-slate-900 truncate">
                  {account.name}
                </h2>
              </div>

              {/* Company Name */}
              <p className="text-sm text-slate-600 mb-4">
                {account.companyName || 'No company name set'}
              </p>

              {/* Access Token Preview */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">
                  Access Token
                </label>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-slate-50 rounded text-sm font-mono text-slate-600">
                    {account.channelAccessToken.slice(0, 8)}...
                  </code>
                  <Key className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 " />
            <span className='text-slate-500 '>Edit</span>
          </Button>
        </div>
      </div>
      
      <LineAccountSettingsDialog
        account={account}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}