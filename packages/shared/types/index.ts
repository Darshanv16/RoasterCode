export type Language = 'python' | 'javascript';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Verdict = 
  | 'ACCEPTED' 
  | 'WRONG_ANSWER' 
  | 'RUNTIME_ERROR' 
  | 'COMPILATION_ERROR' 
  | 'TIME_LIMIT_EXCEEDED' 
  | 'MEMORY_LIMIT_EXCEEDED' 
  | 'PENDING';
export type RoastMood = 'praise' | 'roast';

export interface RoastResponse {
  verdict: string;
  mood: RoastMood;
  roast: string;        // 2-3 funny sentences + 1 emoji
  explanation: string;  // plain English technical explanation
  hint: string;         // nudge toward solution without spoiling it
}

export interface SubmissionResult {
  id: string;
  verdict: Verdict;
  runtime: number | null;      // milliseconds
  memory: number | null;       // kilobytes
  passedTests: number;
  totalTests: number;
  errorMessage: string | null;
  expectedOutput: string | null;
  actualOutput: string | null;
}

export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  xpReward: number;
  acceptanceRate: number;
}
