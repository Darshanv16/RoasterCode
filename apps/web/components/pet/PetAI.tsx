'use client';

import { Button } from '@/components/ui/Button';
import { creditsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useCreditsStore } from '@/stores/creditsStore';
import { usePetStore } from '@/stores/petStore';
import { useUserStore } from '@/stores/userStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Lightbulb, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PetStageRenderer } from './PetStages';

const ENCOURAGEMENTS = [
  'Keep trying! 🐱',
  'You can do it!',
  'One bug at a time!',
  'Almost there!',
  'Think step by step!',
];

const PET_SOLVE_COSTS = { EASY: 50, MEDIUM: 100, HARD: 200 };

interface PetAIProps {
  problemId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  currentCode: string;
  language: string;
  onSolution?: (code: string, explanation: string) => void;
}

export function PetAI({
  problemId,
  difficulty,
  currentCode,
  language,
  onSolution,
}: PetAIProps) {
  const { petName, stage } = usePetStore();
  const user = useUserStore((s) => s.user);
  const problemsSolved = user?.problemsSolved ?? 0;
  const toAiUnlock = Math.max(0, 15 - problemsSolved);
  const { balance, refreshAfterSpend } = useCreditsStore();
  const [message, setMessage] = useState(ENCOURAGEMENTS[0]);
  const [hintBubble, setHintBubble] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [casting, setCasting] = useState(false);
  const [showSolveConfirm, setShowSolveConfirm] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const aiUnlocked = stage >= 3;

  const solveCost = PET_SOLVE_COSTS[difficulty];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hintBubble) return;
    const timer = setTimeout(() => setHintBubble(null), 15000);
    return () => clearTimeout(timer);
  }, [hintBubble]);

  const handlePetHint = useCallback(async () => {
    if (balance < 10) {
      toast.error('Not enough credits! Need 10 credits for a Pet Hint.');
      return;
    }
    setThinking(true);
    setHintBubble(null);
    try {
      const { data } = await creditsApi.petHint({ problemId, currentCode, language });
      setHintBubble(data.hint);
      refreshAfterSpend(data.balance);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get hint');
    } finally {
      setThinking(false);
    }
  }, [balance, problemId, currentCode, language, refreshAfterSpend]);

  const handlePetSolve = useCallback(async () => {
    if (balance < solveCost) {
      toast.error(`Not enough credits! Need ${solveCost} credits.`);
      return;
    }
    setShowSolveConfirm(false);
    setCasting(true);
    try {
      const { data } = await creditsApi.petSolve({ problemId, language });
      refreshAfterSpend(data.balance);
      setExplanation(data.explanation);
      onSolution?.(data.solution, data.explanation);
      if (data.achievement) {
        toast.success(`${data.achievement.icon} Achievement: ${data.achievement.title}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get solution');
    } finally {
      setCasting(false);
    }
  }, [balance, solveCost, problemId, language, onSolution, refreshAfterSpend]);

  return (
    <div className="fixed bottom-24 left-6 z-40 flex flex-col items-start gap-2 max-w-xs">
      <AnimatePresence>
        {hintBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass rounded-2xl border border-accent/30 p-4 text-sm text-text-primary shadow-accent-sm relative"
          >
            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-surface border-r border-b border-accent/30 rotate-45" />
            {hintBubble}
          </motion.div>
        )}
      </AnimatePresence>

      {explanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl border border-gold/30 p-3 text-xs text-text-muted"
        >
          <p className="text-gold font-medium mb-1">Solution provided by {petName} ✨</p>
          {explanation}
        </motion.div>
      )}

      <div className="flex items-end gap-3">
        <div className="relative">
          {aiUnlocked && (
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-accent bg-accent/10 border border-accent/30 rounded-full px-2 py-0.5 whitespace-nowrap">
              AI Mode 🤖
            </span>
          )}
          <div
            className={cn(
              'rounded-2xl glass border p-2',
              aiUnlocked ? 'border-accent/40 shadow-accent-sm' : 'border-border',
              thinking && 'animate-pulse',
              casting && 'animate-pet-evolve'
            )}
          >
            <PetStageRenderer
              stage={stage}
              glowingEyes={aiUnlocked}
              eyesSpinning={thinking}
            />
          </div>
          <p className="text-xs text-text-muted mt-1 text-center max-w-[80px] truncate">
            {aiUnlocked ? (thinking ? 'Thinking...' : casting ? 'Casting...' : message) : message}
          </p>
        </div>

        {aiUnlocked ? (
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              magnetic={false}
              className="text-xs py-1.5 px-3 gap-1.5"
              onClick={handlePetHint}
              disabled={thinking || casting}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Pet Hint — 10
            </Button>
            <Button
              magnetic={false}
              className="text-xs py-1.5 px-3 gap-1.5"
              onClick={() => setShowSolveConfirm(true)}
              disabled={thinking || casting}
            >
              <Bot className="h-3.5 w-3.5" />
              Pet Solve — {solveCost}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-text-dim max-w-[140px] leading-relaxed">
            Reach stage 3 to unlock AI hints!
            {toAiUnlock > 0 && ` (${toAiUnlock} more problems)`}
          </p>
        )}
      </div>

      <AnimatePresence>
        {showSolveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
            onClick={() => setShowSolveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass rounded-2xl border border-border p-6 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-gold" />
                <h3 className="font-bold text-text-primary">Pet Solve</h3>
              </div>
              <p className="text-sm text-text-muted mb-4">
                This costs <span className="text-gold font-bold">{solveCost} credits</span>. Are you
                sure?
              </p>
              <p className="text-xs text-text-dim mb-4">
                Your balance: <span className="text-gold">{balance} credits</span>
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" magnetic={false} className="flex-1" onClick={() => setShowSolveConfirm(false)}>
                  Cancel
                </Button>
                <Button magnetic={false} className="flex-1" onClick={handlePetSolve}>
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
