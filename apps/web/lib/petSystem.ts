export type PetStage = {
  stage: number;
  name: string;
  minProblems: number;
  maxProblems: number;
  color: string;
};

const STAGES: PetStage[] = [
  { stage: 0, name: 'Egg', minProblems: 0, maxProblems: 0, color: '#A78BFA' },
  { stage: 1, name: 'Hatchling', minProblems: 1, maxProblems: 4, color: '#A78BFA' },
  { stage: 2, name: 'Coder', minProblems: 5, maxProblems: 14, color: '#7C3AED' },
  { stage: 3, name: 'Hacker', minProblems: 15, maxProblems: 29, color: '#4C1D95' },
  { stage: 4, name: 'Wizard', minProblems: 30, maxProblems: 49, color: '#6366F1' },
  { stage: 5, name: 'Legend', minProblems: 50, maxProblems: Infinity, color: '#FFD700' },
];

export const PET_EVENTS = {
  HAPPY: 'pet:happy',
  SAD: 'pet:sad',
  EVOLVE: 'pet:evolve',
} as const;

export function getPetStage(problemsSolved: number): PetStage {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (problemsSolved >= STAGES[i].minProblems) {
      return STAGES[i];
    }
  }
  return STAGES[0];
}

export function getPetName(stage: number): string {
  return STAGES[stage]?.name ?? 'Egg';
}

export function getProblemsToNextStage(problemsSolved: number): number {
  const current = getPetStage(problemsSolved);
  if (current.stage >= 5) return 0;
  const next = STAGES[current.stage + 1];
  return Math.max(0, next.minProblems - problemsSolved);
}

export function getStageProgress(problemsSolved: number): number {
  const current = getPetStage(problemsSolved);
  if (current.stage >= 5) return 100;
  const next = STAGES[current.stage + 1];
  const range = next.minProblems - current.minProblems;
  const progress = problemsSolved - current.minProblems;
  return Math.min(100, Math.round((progress / range) * 100));
}

export function triggerPetHappy() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PET_EVENTS.HAPPY));
  }
}

export function triggerPetSad() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PET_EVENTS.SAD));
  }
}

export function triggerPetEvolve(newStage: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PET_EVENTS.EVOLVE, { detail: { newStage } }));
  }
}

export { STAGES };
