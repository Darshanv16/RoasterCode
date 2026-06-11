import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PetStore {
  petName: string;
  stage: number;
  isHappy: boolean;
  isSad: boolean;
  isEvolving: boolean;
  totalRoastsSurvived: number;
  setPetName: (name: string) => void;
  setStage: (stage: number) => void;
  triggerHappy: () => void;
  triggerSad: () => void;
  triggerEvolve: (newStage: number) => void;
  incrementRoasts: () => void;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set) => ({
      petName: 'Byte',
      stage: 0,
      isHappy: false,
      isSad: false,
      isEvolving: false,
      totalRoastsSurvived: 0,
      setPetName: (petName) => set({ petName }),
      setStage: (stage) => set({ stage }),
      triggerHappy: () => {
        set({ isHappy: true });
        setTimeout(() => set({ isHappy: false }), 2000);
      },
      triggerSad: () => {
        set({ isSad: true });
        setTimeout(() => set({ isSad: false }), 2000);
      },
      triggerEvolve: (newStage) => {
        set({ isEvolving: true });
        setTimeout(() => set({ isEvolving: false, stage: newStage }), 3000);
      },
      incrementRoasts: () =>
        set((s) => ({ totalRoastsSurvived: s.totalRoastsSurvived + 1 })),
    }),
    { name: 'roastcoder-pet' }
  )
);
