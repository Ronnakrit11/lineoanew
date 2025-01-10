import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  onClick: () => void;
  className?: string;
}

export function SidebarToggle({ onClick, className }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "lg:hidden p-2 hover:bg-foreground/5 rounded-md transition-colors ",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        className
      )}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5 text-slate-600" />
    </button>
  );
}