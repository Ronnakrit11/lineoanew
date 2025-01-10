import { ChevronLeft, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarHeaderProps {
  onClose: () => void;
  onDashboardClick: () => void;
  onLineSettingsClick: () => void;
  showDashboard: boolean;
  showLineSettings: boolean;
}

export function SidebarHeader({ 
  onClose, 
  onDashboardClick, 
  onLineSettingsClick,
  showDashboard,
  showLineSettings 
}: SidebarHeaderProps) {
  return (
    <div className="flex-none p-4 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Astra</h2>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className={cn(
            "lg:hidden p-2 hover:bg-slate-100 rounded-full transition-colors",
            "text-slate-600 hover:text-slate-900"
          )}
          aria-label="Close sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <nav className="space-y-1">
        <SidebarNavItem 
          href="#" 
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Dashboard"
          onClick={onDashboardClick}
          isActive={showDashboard}
        />
        <SidebarNavItem 
          href="#" 
          icon={<MessageSquare className="w-5 h-5" />}
          label="Chat"
        />
        <SidebarNavItem 
          href="#" 
          icon={<Settings className="w-5 h-5" />}
          label="LINE OA Settings"
          onClick={onLineSettingsClick}
          isActive={showLineSettings}
        />
      </nav>
    </div>
  );
}