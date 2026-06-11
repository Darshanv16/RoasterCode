'use client';

import { cn } from '@/lib/utils';
import { useCreditsStore } from '@/stores/creditsStore';
import { useUserStore } from '@/stores/userStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CreditsChip() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { balance, history, fetchCredits } = useCreditsStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCredits();
    }
  }, [isAuthenticated, fetchCredits]);

  useEffect(() => {
    const onRefresh = () => fetchCredits();
    window.addEventListener('credits:refresh', onRefresh);
    return () => window.removeEventListener('credits:refresh', onRefresh);
  }, [fetchCredits]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 transition-colors"
      >
        💎 {balance.toLocaleString()}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-50 w-72 glass rounded-xl border border-border p-4 shadow-card"
            >
              <p className="text-sm font-semibold text-text-primary mb-3">Credits</p>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {history.length === 0 && (
                  <p className="text-xs text-text-dim">No transactions yet</p>
                )}
                {history.map((tx, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-text-muted truncate mr-2">{tx.reason}</span>
                    <span
                      className={cn(
                        'font-medium shrink-0',
                        tx.amount > 0 ? 'text-success' : 'text-danger'
                      )}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="text-text-muted">Balance</span>
                <span className="font-bold text-gold">{balance} credits</span>
              </div>
              <p className="text-[10px] text-text-dim mt-2">
                Earn more by solving problems →
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
