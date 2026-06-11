import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data ?? '');
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original.url?.includes('/auth/refresh')) {
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = (data as { accessToken: string }).accessToken;
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
      }
    }

    const message =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      'Something went wrong';

    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${error.response?.status} ${original?.url}:`, message);
    }

    return Promise.reject(new Error(message));
  }
);

export type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  xp: number;
  level: number;
  streak?: number;
  maxStreak?: number;
  problemsSolved?: number;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me'),
  refresh: () => api.post<AuthResponse>('/auth/refresh'),
};

export type UserProfile = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  xp: number;
  level: number;
  streak: number;
  maxStreak: number;
  createdAt: string;
  role: 'USER' | 'ADMIN';
  problemsSolved: number;
  totalSubmissions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  recentAccepted: Array<{
    id: string;
    problemTitle: string;
    language: string;
    runtime: number | null;
    createdAt: string;
  }>;
};

export type AchievementWithStatus = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlocked: boolean;
  unlockedAt: string | null;
};

export type UserStats = {
  verdictCounts: Record<string, number>;
  problemsSolved: number;
  heatmap: { date: string; count: number }[];
  xpHistory: { date: string; xp: number }[];
};

export type SubmissionListItem = {
  id: string;
  problemTitle: string;
  verdict: string;
  language: string;
  runtime: number | null;
  createdAt: string;
};

export const usersApi = {
  getByUsername: (username: string) => api.get<UserProfile>(`/users/${username}`),
  updateProfile: (data: { bio?: string; avatarUrl?: string }) =>
    api.put<{ user: User }>('/users/me', data),
  getMyAchievements: () =>
    api.get<{ achievements: AchievementWithStatus[] }>('/users/me/achievements'),
  getMyStats: () => api.get<UserStats>('/users/me/stats'),
  checkUsername: async (username: string): Promise<boolean> => {
    try {
      await api.get(`/users/${username}`);
      return false;
    } catch {
      return true;
    }
  },
};

export type ProblemFilters = {
  page?: number;
  limit?: number;
  difficulty?: string;
  tag?: string;
  sort?: 'newest' | 'oldest' | 'acceptance';
};

export type ProblemListItem = {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  xpReward: number;
  acceptanceRate?: number;
  solveStatus?: 'solved' | 'attempted' | 'unsolved';
  totalAttempts?: number;
};

export type ProblemsListResponse = {
  problems: ProblemListItem[];
  total: number;
  page: number;
  totalPages: number;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarUrl?: string | null;
  xp: number;
  level?: number;
  streak?: number;
  problemsSolved?: number;
};

export type CreditTransaction = {
  amount: number;
  reason: string;
  createdAt: string;
};

export type LearningChapter = {
  id: number;
  name: string;
  description: string;
  badge: string;
  badgeLabel: string;
  unlockRequirement: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  problemCount: number;
  solvedCount: number;
  creditsEarned: number;
  problems: Array<{
    id: string;
    slug: string;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    xpReward: number;
    solved: boolean;
  }>;
};

export type LanguageInfo = {
  id: string;
  name: string;
  available: boolean;
  version?: string;
  installUrl?: string;
  status: 'available' | 'limited' | 'unavailable';
};

export type RoastResponse = {
  verdict: string;
  mood: 'praise' | 'roast';
  roast: string;
  explanation: string;
  hint: string;
};

export type SubmissionVerdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'PENDING';

export type SubmissionResult = {
  id: string;
  verdict: SubmissionVerdict;
  runtime: number | null;
  memory: number | null;
  passedTests: number;
  totalTests: number;
  errorMessage: string | null;
  expectedOutput: string | null;
  actualOutput: string | null;
};

export type TestRunResult = {
  testCaseId: string;
  passed: boolean;
  actualOutput: string | null;
  expectedOutput: string;
  runtime: number | null;
  errorMessage?: string | null;
};

export type ProblemDetail = {
  id: string;
  slug: string;
  title: string;
  statement: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  xpReward: number;
  constraints: string;
  hints: string[];
  starterCode: Record<string, string>;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  testCases: Array<{ id: string; input: string; order: number }>;
};

export type AdminProblem = {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  xpReward: number;
  isPublished: boolean;
  totalAttempts: number;
  acceptanceRate: number;
};

export type AdminStats = {
  totalUsers: number;
  totalProblems: number;
  submissionsToday: number;
  acceptanceRate: number;
  activeUsersToday: number;
};

export type AdminProblemDetail = Omit<ProblemDetail, 'testCases'> & {
  isPublished: boolean;
  timeLimit: number;
  memoryLimit: number;
  testCases: Array<{ id: string; input: string; expected: string; isHidden: boolean; order: number }>;
};

export type CreateProblemPayload = {
  title: string;
  statement: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  constraints: string;
  starterCode: Record<string, string>;
  hints: string[];
  xpReward: number;
  timeLimit: number;
  memoryLimit: number;
  examples: Array<{ input: string; output: string; explanation?: string; order?: number }>;
  testCases: Array<{ input: string; expected: string; isHidden: boolean; order?: number }>;
};

export const problemsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    tag?: string;
    sort?: 'newest' | 'oldest' | 'acceptance';
  }) => api.get<ProblemsListResponse>('/problems', { params }),
  getBySlug: (slug: string) => api.get<ProblemDetail>(`/problems/${slug}`),
  create: (data: CreateProblemPayload) => api.post('/problems', data),
  update: (id: string, data: Partial<CreateProblemPayload>) => api.put(`/problems/${id}`, data),
  delete: (id: string) => api.delete(`/problems/${id}`),
  togglePublish: (id: string) => api.post(`/problems/${id}/publish`),
};

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats'),
  getProblems: () => api.get<{ problems: AdminProblem[] }>('/admin/problems'),
  getProblem: (id: string) => api.get<AdminProblemDetail>(`/admin/problems/${id}`),
  togglePublish: (id: string) => api.put(`/admin/problems/${id}/toggle-publish`),
};

export const submissionsApi = {
  getMine: () => api.get<{ submissions: SubmissionListItem[] }>('/submissions/user/me'),
  create: (data: { problemId: string; code: string; language: string }) =>
    api.post<{ submissionId: string }>('/submissions', data),
  get: (id: string) =>
    api.get<
      SubmissionResult & {
        code: string;
        language: string;
        xpEarned: number;
        roastGenerated: boolean;
        createdAt: string;
        roast: RoastResponse | null;
      }
    >(`/submissions/${id}`),
  byProblem: (problemId: string) =>
    api.get<{
      submissions: Array<{
        id: string;
        verdict: string;
        language: string;
        runtime: number | null;
        memory: number | null;
        createdAt: string;
      }>;
    }>(`/submissions/problem/${problemId}`),
  run: (data: {
    problemId: string;
    code: string;
    language: string;
    customTestCases?: Array<{ input: string; expected?: string }>;
  }) =>
    api.post<{
      results: TestRunResult[];
      passed: number;
      total: number;
      compileError: string | null;
    }>('/submissions/run', data),
};

export const leaderboardApi = {
  get: (params?: { by?: 'xp' | 'problems' | 'streak'; limit?: number }) =>
    api.get<{ leaderboard: LeaderboardEntry[]; yourEntry: LeaderboardEntry | null }>(
      '/leaderboard',
      { params }
    ),
};

export const creditsApi = {
  getBalance: () =>
    api.get<{ balance: number; history: CreditTransaction[] }>('/credits/balance'),
  petSolve: (data: { problemId: string; language: string }) =>
    api.post<{
      solution: string;
      explanation: string;
      creditsSpent: number;
      balance: number;
      achievement: { title: string; icon: string } | null;
    }>('/credits/pet-solve', data),
  petHint: (data: { problemId: string; currentCode: string; language: string }) =>
    api.post<{ hint: string; creditsSpent: number; balance: number }>(
      '/credits/pet-hint',
      data
    ),
};

export const learningApi = {
  getPath: () =>
    api.get<{
      chapters: LearningChapter[];
      overallProgress: { solved: number; total: number; percent: number };
    }>('/learning/path'),
  getChapter: (id: number) => api.get<{ chapter: LearningChapter }>(`/learning/chapter/${id}`),
  startChapter: (id: number) => api.post(`/learning/chapter/${id}/start`),
};

export const systemApi = {
  getLanguages: () => api.get<{ languages: LanguageInfo[] }>('/system/languages'),
};

export default api;
