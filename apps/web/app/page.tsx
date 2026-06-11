'use client';

import { LandingRoastCard } from '@/components/landing/LandingRoastCard';
import { Button } from '@/components/ui/Button';
import type { RoastResponse } from '@roastcoder/shared';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Code2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DifficultyDonut } from '@/components/landing/DifficultyDonut';

const ROAST_TICKER = [
  "🔥 'Your O(n³) solution... really leaned into the chaos' — Two Sum, Wrong Answer",
  "✅ 'That sliding window was chef's kiss. Genuinely proud.' — Longest Substring",
  "🔥 'Off-by-one error. Classic. The compiler felt it too.' — Binary Search, Wrong Answer",
  "✅ 'DP in Python with clean variable names? You're dangerous.' — Climbing Stairs",
  "🔥 'Stack overflow. Bold choice. 0/10 for prod.' — Valid Parentheses, Runtime Error",
  "✅ 'Binary search with no infinite loops? Are you feeling okay?' — Search Insert Position",
  "🔥 'You sorted it... then searched linearly anyway. Why.' — Find Peak Element",
  "✅ 'Two pointers, zero bugs. I hate how much I respect this.' — Container With Most Water",
];

const ACCEPTED_ROAST: RoastResponse = {
  verdict: 'ACCEPTED',
  mood: 'praise',
  roast:
    "Clean HashMap solution. O(n) time, O(n) space, and you even remembered to handle the edge case where the array has exactly two elements. I'm not crying, you're crying. 🎉",
  explanation:
    "One-pass hash map approach: for each number, check if (target - num) exists in the map. If yes, you're done. If no, add it. Perfect.",
  hint: 'Try solving it without extra space for bonus points.',
};

const WRONG_ROAST: RoastResponse = {
  verdict: 'WRONG_ANSWER',
  mood: 'roast',
  roast:
    'You close brackets that were never opened. This code has the structural integrity of a house of cards in a hurricane. Gordon Ramsay would push the keyboard off the table. 🔥',
  explanation:
    "Your counter approach fails for inputs like '](' — you need a stack to track which bracket type opened.",
  hint: 'Push opening brackets onto a stack. When you see a closing bracket, pop and check if it matches.',
};

const STEPS = [
  {
    icon: Code2,
    title: 'Write Code',
    desc: 'Pick a problem from our curated set. Write your solution in any of 8 languages with Monaco editor.',
  },
  {
    icon: Send,
    title: 'Submit',
    desc: 'Hit submit. Your code runs against hidden test cases in an isolated Judge0 sandbox.',
  },
  {
    icon: Bot,
    title: 'Get Roasted (or Hyped)',
    desc: "AI evaluates your code. Win or lose, you'll get honest, funny, actionable feedback.",
  },
];

const STATS = [
  { value: '12,847', label: 'Submissions Roasted' },
  { value: '4,291', label: 'Developers Humbled' },
  { value: '891', label: 'Problems Solved Today' },
  { value: '99ms', label: 'Average Roast Time' },
];

const heroLines = ['Code.', 'Fail.', 'Get Roasted.', 'Repeat.'];

export default function HomePage() {
  const tickerItems = [...ROAST_TICKER, ...ROAST_TICKER];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-bg animate-grid-drift opacity-60" />
        <div className="absolute inset-0 bg-gradient-radial from-accent/10 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-6"
          >
            The LeetCode Killer
          </motion.p>

          <h1 className="text-4xl sm:text-6xl lg:text-hero font-bold mb-6 leading-tight">
            {heroLines.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                className="block text-text-primary"
              >
                {i === 2 ? <span className="text-gradient">{line}</span> : line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-text-muted max-w-xl mx-auto mb-10"
          >
            The programming platform that gives your bugs the feedback they deserve.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link href="/register">
              <Button className="text-base px-8 py-3">
                Start Roasting <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/problems">
              <Button variant="ghost" className="text-base px-8 py-3">
                Browse Problems
              </Button>
            </Link>
          </motion.div>

          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-surface/30 backdrop-blur-sm">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex animate-ticker whitespace-nowrap py-3">
              {tickerItems.map((item, i) => (
                <span key={i} className="mx-8 text-sm text-text-muted">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DIFFICULTY DISTRIBUTION */}
      <section className="py-24 px-4 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
            Curated for every level
          </h2>
          <p className="text-text-muted text-center mb-12">
            From warm-up to nightmare fuel — pick your poison
          </p>
          <DifficultyDonut />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent/50 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
                  <step.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLE ROASTS */}
      <section className="py-24 px-4 bg-surface/30">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">See it in action</h2>
          <p className="text-text-muted text-center mb-12">Real AI feedback — brutal or beautiful</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-success mb-2 font-medium">✅ Accepted — Two Sum</p>
              <LandingRoastCard roast={ACCEPTED_ROAST} />
            </div>
            <div>
              <p className="text-sm text-danger mb-2 font-medium">❌ Wrong Answer — Valid Parentheses</p>
              <LandingRoastCard roast={WRONG_ROAST} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-4 border-y border-border">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                'text-center',
                i < STATS.length - 1 && 'md:border-r md:border-border'
              )}
            >
              <p className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stat.value}</p>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-4xl font-bold text-gradient mb-4">Ready to get roasted?</h2>
        <p className="text-text-muted mb-8">No credit card. No setup. Just code and consequences.</p>
        <Link href="/register">
          <Button className="text-lg px-10 py-3">Join for Free →</Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface border-t border-border py-8 px-4">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <span className="text-accent">⚡</span>
            <span className="font-bold text-text-primary">RoastCoder</span>
          </div>
          <p>© 2024 RoastCoder</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" className="hover:text-accent transition-colors">
              GitHub
            </a>
            <a href="https://twitter.com" className="hover:text-accent transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
