'use client';

import { XPBar } from '@/components/ui/XPBar';
import { cn } from '@/lib/utils';
import {
  getPetStage,
  getProblemsToNextStage,
  getStageProgress,
  STAGES,
} from '@/lib/petSystem';
import { usePetStore } from '@/stores/petStore';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { PetStageRenderer } from './PetStages';

interface PetPopupProps {
  problemsSolved: number;
  streak?: number;
  onClose: () => void;
}

export function PetPopup({ problemsSolved, streak = 0, onClose }: PetPopupProps) {
  const { petName, stage, totalRoastsSurvived, setPetName } = usePetStore();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(petName);

  const currentStage = getPetStage(problemsSolved);
  const toNext = getProblemsToNextStage(problemsSolved);
  const progress = getStageProgress(problemsSolved);
  const nextStage = STAGES[stage + 1];

  const handleNameSave = () => {
    if (nameInput.trim()) setPetName(nameInput.trim());
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full right-0 mb-3 w-72 glass rounded-xl border border-accent/20 shadow-accent p-4 z-50"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <PetStageRenderer stage={stage} />
        <div>
          {isEditing ? (
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="bg-surface-2 border border-accent/30 rounded px-2 py-0.5 text-sm text-text-primary outline-none focus:border-accent"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-text-primary hover:text-accent transition-colors"
            >
              {petName} ✏️
            </button>
          )}
          <p className="text-gradient text-xs font-medium">{currentStage.name}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>Evolution Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-3 overflow-hidden border border-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-accent shadow-accent-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: '🔥', label: 'Streak', value: streak },
          { icon: '⚡', label: 'Total XP', value: problemsSolved * 100 },
          { icon: '✅', label: 'Solved', value: problemsSolved },
          { icon: '💀', label: 'Roasts', value: totalRoastsSurvived },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-surface-2 border border-border p-2">
            <p className="text-xs text-text-muted">{stat.icon} {stat.label}</p>
            <p className="text-sm font-semibold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {nextStage && (
        <div className="rounded-lg bg-surface-2 border border-border p-3 relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-sm bg-surface/50 z-10 flex items-center justify-center">
            <p className="text-xs text-text-muted text-center">
              ??? — solve {toNext} more to unlock
            </p>
          </div>
          <div className="opacity-30 blur-sm flex justify-center">
            <PetStageRenderer stage={stage + 1} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
