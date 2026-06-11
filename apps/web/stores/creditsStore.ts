'use client';

import { creditsApi, type CreditTransaction } from '@/lib/api';
import { create } from 'zustand';

interface CreditsStore {
  balance: number;
  history: CreditTransaction[];
  isLoading: boolean;
  fetchCredits: () => Promise<void>;
  setBalance: (balance: number) => void;
  refreshAfterSpend: (balance: number) => void;
}

export const useCreditsStore = create<CreditsStore>((set) => ({
  balance: 0,
  history: [],
  isLoading: false,
  fetchCredits: async () => {
    set({ isLoading: true });
    try {
      const { data } = await creditsApi.getBalance();
      set({ balance: data.balance, history: data.history, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  setBalance: (balance) => set({ balance }),
  refreshAfterSpend: (balance) => {
    set({ balance });
    creditsApi.getBalance().then(({ data }) => set({ history: data.history }));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('credits:refresh'));
    }
  },
}));
