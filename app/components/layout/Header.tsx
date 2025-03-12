"use client";

import { Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DocumentButtons } from '../button/DocumentButtons';
import { AddLineAccountButton } from '../line-account/AddLineAccountButton';
import { AddFacebookPageButton } from '../facebook/AddFacebookPageButton';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

export function Header({ toggleSidebar, title }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-foreground/5 border-b border-foreground/10 bg-slate-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-foreground/5 rounded-md transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-geist-sans)]">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <AddFacebookPageButton />
          <AddLineAccountButton />
          <DocumentButtons />
          
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-foreground/5 rounded-md transition-colors flex items-center gap-2 text-sm"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}