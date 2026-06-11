'use client';

import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { motion } from 'framer-motion';
import Link from 'next/link';

const codeSnippets = [
  'def twoSum(nums, target):',
  '  seen = {}',
  '  for i, n in enumerate(nums):',
  '    if target - n in seen:',
  '      return [seen[target-n], i]',
  'class Solution {',
  '  public int[] twoSum(int[] nums, int t) {',
  'function maxProfit(prices) {',
  '  let min = Infinity, profit = 0;',
  'const dfs = (node) => {',
  '  if (!node) return null;',
];

interface AuthLayoutProps {
  children: React.ReactNode;
  tagline: string;
}

export function AuthLayout({ children, tagline }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-center overflow-hidden grid-bg">
        <ParticleBackground className="absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />

        {codeSnippets.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: [0, 0.4, 0], x: [0, 10, 20] }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 1.2,
              ease: 'linear',
            }}
            className="absolute font-mono text-xs text-accent/30 whitespace-nowrap"
            style={{ top: `${10 + i * 8}%`, left: `${5 + (i % 3) * 20}%` }}
          >
            {line}
          </motion.div>
        ))}

        <div className="relative z-10 p-12">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-gradient">RoastCoder</span>
          </Link>
          <h2 className="text-4xl font-bold text-text-primary mb-4">{tagline}</h2>
          <p className="text-text-muted text-lg max-w-md">
            Join thousands of coders getting roasted, ranked, and evolving their pets.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold text-gradient">RoastCoder</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
