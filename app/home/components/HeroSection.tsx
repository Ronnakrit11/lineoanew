import { HeroTitle } from './hero/HeroTitle';
import { HeroActions } from './hero/HeroActions';
import { HeroStats } from './hero/HeroStats';
import { ChatWidget } from '@/app/components/chat/widget/ChatWidget';

export function HeroSection() {
  return (
    <div className="relative min-h-[80vh] flex items-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.15),transparent)]" />
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="flex flex-col items-center">
          <HeroTitle />
          <HeroActions />
          <HeroStats />
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}