"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4"
    >
      <Link
        href="/login"
        className="group flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all duration-300"
      >
        <Sparkles className="w-5 h-5" />
        <span>Get Started Free</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
      
      <Link
        href="#features"
        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 backdrop-blur-sm"
        scroll={false}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        See Features
      </Link>
    </motion.div>
  );
}