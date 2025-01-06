"use client"
import { motion } from 'framer-motion';
import { GradientText } from '../animations/GradientText';

export function HeroTitle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
        <GradientText>
          Unify Your Customer
        </GradientText>
        <br />
        <span className="text-white">Communications</span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
        One platform for all your customer interactions. Seamlessly manage LINE, Facebook, and web chat with powerful CRM tools.
      </p>
    </motion.div>
  );
}