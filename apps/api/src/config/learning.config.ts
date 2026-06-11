export interface LearningChapter {
  id: number;
  name: string;
  description: string;
  badge: string;
  badgeLabel: string;
  problemSlugs: string[];
  unlockRequirement: string;
  requiredChapterId: number | null;
}

export const LEARNING_CHAPTERS: LearningChapter[] = [
  {
    id: 1,
    name: 'Baby Steps',
    description: 'Learn the absolute basics',
    badge: '🌱',
    badgeLabel: 'Seedling',
    problemSlugs: ['binary-search', 'valid-parentheses'],
    unlockRequirement: '0 problems solved',
    requiredChapterId: null,
  },
  {
    id: 2,
    name: 'Getting Warm',
    description: 'Arrays and simple logic',
    badge: '🔥',
    badgeLabel: 'Spark',
    problemSlugs: ['two-sum', 'best-time-to-buy-and-sell-stock'],
    unlockRequirement: 'Complete Chapter 1',
    requiredChapterId: 1,
  },
  {
    id: 3,
    name: 'Building Blocks',
    description: 'Dynamic programming and linked lists',
    badge: '⚡',
    badgeLabel: 'Charged',
    problemSlugs: ['climbing-stairs', 'reverse-linked-list'],
    unlockRequirement: 'Complete Chapter 2',
    requiredChapterId: 2,
  },
  {
    id: 4,
    name: 'Level Up',
    description: 'Sliding window and intervals',
    badge: '💎',
    badgeLabel: 'Crystal',
    problemSlugs: ['longest-substring-without-repeating-characters', 'merge-intervals'],
    unlockRequirement: 'Complete Chapter 3',
    requiredChapterId: 3,
  },
  {
    id: 5,
    name: 'Elite Zone',
    description: 'Graphs and advanced DP',
    badge: '👑',
    badgeLabel: 'Master',
    problemSlugs: ['number-of-islands', 'coin-change'],
    unlockRequirement: 'Complete Chapter 4',
    requiredChapterId: 4,
  },
];

export const CHAPTER_COMPLETION_CREDITS = 50;
