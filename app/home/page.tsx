import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PricingCard } from './components/PricingCard';
import { FadeIn } from './components/animations/FadeIn';
import { FloatingCard } from './components/animations/FloatingCard';
import { GradientText } from './components/animations/GradientText';

// Define pricing plans data
const pricingPlans = [
  {
    title: 'Starter',
    price: '$0',
    description: 'Ideal for hobbyists who require basic features.',
    features: [
      '1,000 monthly active wallets',
      'Web, Mobile & Gaming SDKs',
      'Contract & Wallet APIs',
      'Community Support',
      'Blockchain infra (RPC, IPFS)'
    ],
    buttonText: 'Get Started for Free',
    isPopular: false
  },
  {
    title: 'Growth',
    price: '$0',
    description: 'Ideal for scalable production-grade applications.',
    features: [
      '10,000 monthly active wallets',
      'Production Grade Infrastructure',
      'Prioritized Support',
      'User Analytics',
      'Advanced Paymaster Rules'
    ],
    buttonText: 'Claim your 1 month free',
    isPopular: true
  },
  {
    title: 'Pro',
    price: 'Custom',
    description: 'Ideal for teams that require more customization, SLAs, and support.',
    features: [
      'Custom rate limits for APIs & Infra',
      'Dedicated support channel',
      'Guaranteed support response time',
      'Direct access to solutions team',
      'Enterprise grade SLAs'
    ],
    buttonText: 'Contact Us',
    isPopular: false
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black -z-10" />
      
      {/* Navigation */}
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Trusted By Section */}
        <FadeIn delay={0.6}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <p className="text-center text-gray-400 mb-12">Trusted by leading web3 teams</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <FloatingCard key={i} delay={0.2 * i}>
                  <div className="backdrop-blur-md bg-white/5 rounded-lg h-24 flex items-center justify-center border border-white/5">
                    <div className="w-32 h-8 bg-white/10 rounded animate-pulse" />
                  </div>
                </FloatingCard>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <FadeIn>
            <h2 className="text-4xl font-bold text-center mb-4">
              <GradientText>Simple, transparent pricing</GradientText>
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16">
              Choose the plan that best fits your needs
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <FloatingCard key={index} delay={0.2 * index}>
                <PricingCard {...plan} />
              </FloatingCard>
            ))}
          </div>
        </div>

        {/* Footer Gradient */}
        <div className="h-32 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
      </main>
    </div>
  );
}