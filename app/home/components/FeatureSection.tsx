"use client";

import { motion } from 'framer-motion';
import { 
  Bot, 
  MessageSquare, 
  FileText, 
 
  Zap,
  Shield,
  RefreshCw,
  Smartphone
} from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Chat',
    description: 'Intelligent responses and automated support powered by advanced AI',
    icon: <Bot className="w-6 h-6" />,
    color: 'bg-purple-500/10 text-purple-500',
    size: 'col-span-1 sm:col-span-2 lg:col-span-1'
  },
  {
    title: 'Multi-Channel Support',
    description: 'Seamlessly integrate LINE, Facebook, and web chat into one platform',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'bg-blue-500/10 text-blue-500',
    size: 'col-span-1 sm:col-span-2'
  },
  {
    title: 'Fully CRM',
    description: 'Complete customer relationship management with integrated tools',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-green-500/10 text-green-500',
    size: 'col-span-1 sm:col-span-2'
  },
  {
    title: 'Real-Time Updates',
    description: 'Instant message delivery and live status updates',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-yellow-500/10 text-yellow-500',
    size: 'col-span-1 sm:col-span-2 lg:col-span-1'
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and secure data handling',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-red-500/10 text-red-500',
    size: 'col-span-1 sm:col-span-2 lg:col-span-1'
  },
  {
    title: 'Auto Sync',
    description: 'Keep all your channels and data in perfect sync',
    icon: <RefreshCw className="w-6 h-6" />,
    color: 'bg-indigo-500/10 text-indigo-500',
    size: 'col-span-1 sm:col-span-2 lg:col-span-1'
  },
  {
    title: 'Mobile Ready',
    description: 'Fully responsive design works on all devices',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'bg-pink-500/10 text-pink-500',
    size: 'col-span-1 sm:col-span-2'
  }
];

export function FeatureSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-black scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Powerful Features for Modern Business
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            Everything you need to manage customer communications effectively
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6",
                "hover:bg-white/10 transition-all duration-300",
                "group cursor-pointer",
                feature.size
              )}
            >
              <div className={cn(
                "rounded-lg w-12 h-12 flex items-center justify-center mb-4",
                "transition-all duration-300 group-hover:scale-110",
                feature.color
              )}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}