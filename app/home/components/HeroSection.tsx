import Link from 'next/link';
import { FadeIn } from './animations/FadeIn';
import { GradientText } from './animations/GradientText';
import { ChatWidget } from '@/app/components/chat/widget/ChatWidget';

export function HeroSection() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="backdrop-blur-lg bg-black/30 rounded-2xl p-8 border border-white/10">
          <FadeIn>
            <h1 className="text-6xl font-bold text-center mb-8">
              <GradientText>
                All Chat, Website and Marketing
              </GradientText>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto text-center">
              onchain tools to build complete web3 apps — on every EVM chain.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex justify-center gap-4">
              <Link 
                href="#"
                className="backdrop-blur-sm bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30 inline-flex items-center"
              >
             Started <span className="ml-2">→</span>
              </Link>
              <Link 
                href="#"
                className="backdrop-blur-sm bg-black/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-black/40 transition-all duration-300 border border-white/10 hover:border-white/20 inline-flex items-center"
              >
                Contact
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}