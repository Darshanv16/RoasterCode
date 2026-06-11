'use client';

import { cn } from '@/lib/utils';
import { getPetStage, PET_EVENTS } from '@/lib/petSystem';
import { usePetStore } from '@/stores/petStore';
import { useUserStore } from '@/stores/userStore';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PetPopup } from './PetPopup';
import { PetStageRenderer } from './PetStages';

export function CodePet() {
  const { petName, stage, isHappy, isSad, isEvolving, triggerHappy, triggerSad, triggerEvolve, setStage } =
    usePetStore();
  const user = useUserStore((s) => s.user);
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const isProblemPage = /^\/problems\/[^/]+$/.test(pathname ?? '');

  const problemsSolved = user?.problemsSolved ?? 0;
  const [stuckPulse, setStuckPulse] = useState(false);

  useEffect(() => {
    if (!isProblemPage) {
      setStuckPulse(false);
      return;
    }
    const timer = setTimeout(() => setStuckPulse(true), 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [isProblemPage, pathname]);

  useEffect(() => {
    if (stuckPulse) {
      const interval = setInterval(() => setStuckPulse((v) => !v), 2000);
      return () => clearInterval(interval);
    }
  }, [stuckPulse]);

  useEffect(() => {
    const newStage = getPetStage(problemsSolved).stage;
    if (newStage > stage) {
      triggerEvolve(newStage);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#6C55F5', '#A855F7', '#FFD700'],
      });
    } else if (newStage !== stage) {
      setStage(newStage);
    }
  }, [problemsSolved, stage, triggerEvolve, setStage]);

  useEffect(() => {
    const onHappy = () => triggerHappy();
    const onSad = () => triggerSad();
    const onEvolve = (e: Event) => {
      const detail = (e as CustomEvent<{ newStage: number }>).detail;
      triggerEvolve(detail.newStage);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6C55F5', '#A855F7', '#FFD700', '#10B981'],
      });
    };

    window.addEventListener(PET_EVENTS.HAPPY, onHappy);
    window.addEventListener(PET_EVENTS.SAD, onSad);
    window.addEventListener(PET_EVENTS.EVOLVE, onEvolve);
    return () => {
      window.removeEventListener(PET_EVENTS.HAPPY, onHappy);
      window.removeEventListener(PET_EVENTS.SAD, onSad);
      window.removeEventListener(PET_EVENTS.EVOLVE, onEvolve);
    };
  }, [triggerHappy, triggerSad, triggerEvolve]);

  return (
    <>
      <AnimatePresence>
        {isEvolving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="mb-6 flex justify-center">
                <PetStageRenderer stage={stage} isEvolving />
              </div>
              <h2 className="text-3xl font-bold text-gradient-gold animate-pulse-glow">
                YOUR PET EVOLVED!
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-40 group">
        <AnimatePresence>
          {showPopup && (
            <PetPopup
              problemsSolved={problemsSolved}
              streak={user?.streak ?? 0}
              onClose={() => setShowPopup(false)}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowPopup((v) => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex flex-col items-center gap-1"
        >
          {stage >= 3 && (
            <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/30 rounded-full px-2 py-0.5">
              AI Mode
            </span>
          )}
          <span className="text-xs font-medium text-text-muted group-hover:text-accent transition-colors">
            {petName}
          </span>
          <div
            className={cn(
              'rounded-2xl glass border border-accent/20 p-2 shadow-accent-sm',
              'hover:border-accent/40 transition-all duration-300',
              isHappy && 'animate-pet-happy',
              isSad && 'opacity-80',
              stuckPulse && 'animate-pulse-glow border-accent/50'
            )}
          >
            <PetStageRenderer
              stage={stage}
              isHappy={isHappy}
              isSad={isSad}
              isEvolving={isEvolving}
              glowingEyes={stage >= 3}
            />
          </div>
          {stuckPulse && (
            <span className="text-[10px] text-accent animate-bounce">Keep going!</span>
          )}
        </motion.button>
      </div>
    </>
  );
}
