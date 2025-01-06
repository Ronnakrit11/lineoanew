"use client"
import { motion } from 'framer-motion';

const stats = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Messages/Day', value: '1M+' },
  { label: 'Customer Satisfaction', value: '99%' }
];

export function HeroStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap justify-center gap-8 mt-12"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {stat.value}
          </p>
          <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
        </div>
      ))}
    </motion.div>
  );
}