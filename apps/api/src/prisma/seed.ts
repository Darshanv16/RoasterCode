import { PrismaClient, Rarity } from '@prisma/client';
import { problems } from './seed-problems';

const prisma = new PrismaClient();

const achievements = [
  {
    slug: 'first_blood',
    title: 'First Blood',
    description: 'Submitted your first accepted solution',
    icon: '🩸',
    rarity: Rarity.COMMON,
    xpReward: 25,
  },
  {
    slug: 'problem_10',
    title: 'Getting Warm',
    description: 'Solved 10 problems',
    icon: '🔥',
    rarity: Rarity.COMMON,
    xpReward: 50,
  },
  {
    slug: 'problem_50',
    title: 'Grinder',
    description: 'Solved 50 problems',
    icon: '⚙️',
    rarity: Rarity.RARE,
    xpReward: 100,
  },
  {
    slug: 'problem_100',
    title: 'Century Club',
    description: 'Solved 100 problems',
    icon: '💯',
    rarity: Rarity.EPIC,
    xpReward: 200,
  },
  {
    slug: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: '📅',
    rarity: Rarity.RARE,
    xpReward: 75,
  },
  {
    slug: 'streak_30',
    title: 'Unstoppable',
    description: '30-day streak',
    icon: '🚀',
    rarity: Rarity.EPIC,
    xpReward: 200,
  },
  {
    slug: 'bug_hunter',
    title: 'Bug Hunter',
    description: 'Had 10 runtime errors (we all start somewhere)',
    icon: '🐛',
    rarity: Rarity.COMMON,
    xpReward: 10,
  },
  {
    slug: 'speed_demon',
    title: 'Speed Demon',
    description: 'Accepted with runtime under 10ms',
    icon: '⚡',
    rarity: Rarity.RARE,
    xpReward: 100,
  },
  {
    slug: 'polyglot',
    title: 'Polyglot',
    description: 'Accepted in 3 or more languages',
    icon: '🌍',
    rarity: Rarity.RARE,
    xpReward: 100,
  },
  {
    slug: 'night_owl',
    title: 'Night Owl',
    description: 'Submitted between 2AM and 4AM',
    icon: '🦉',
    rarity: Rarity.COMMON,
    xpReward: 25,
  },
  {
    slug: 'smart_delegator',
    title: 'Cheater? No — Smart Delegator!',
    description: 'Used Pet Solve for the first time',
    icon: '🤖',
    rarity: Rarity.COMMON,
    xpReward: 10,
  },
  {
    slug: 'chapter_seedling',
    title: 'Seedling',
    description: 'Completed Chapter 1: Baby Steps',
    icon: '🌱',
    rarity: Rarity.COMMON,
    xpReward: 25,
  },
  {
    slug: 'chapter_spark',
    title: 'Spark',
    description: 'Completed Chapter 2: Getting Warm',
    icon: '🔥',
    rarity: Rarity.RARE,
    xpReward: 25,
  },
  {
    slug: 'chapter_charged',
    title: 'Charged',
    description: 'Completed Chapter 3: Building Blocks',
    icon: '⚡',
    rarity: Rarity.RARE,
    xpReward: 25,
  },
  {
    slug: 'chapter_crystal',
    title: 'Crystal',
    description: 'Completed Chapter 4: Level Up',
    icon: '💎',
    rarity: Rarity.EPIC,
    xpReward: 25,
  },
  {
    slug: 'chapter_master',
    title: 'Master',
    description: 'Completed Chapter 5: Elite Zone',
    icon: '👑',
    rarity: Rarity.LEGENDARY,
    xpReward: 50,
  },
  {
    slug: 'hard_first',
    title: 'Bold Move',
    description: 'Solved a HARD problem as your first acceptance',
    icon: '💪',
    rarity: Rarity.EPIC,
    xpReward: 150,
  },
];

async function main() {
  console.log('Seeding achievements...');
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }

  console.log('Seeding problems...');
  for (const problem of problems) {
    const { examples, testCases, ...problemData } = problem;

    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: {
        ...problemData,
        isPublished: true,
        examples: {
          deleteMany: {},
          create: examples,
        },
        testCases: {
          deleteMany: {},
          create: testCases,
        },
      },
      create: {
        ...problemData,
        isPublished: true,
        examples: { create: examples },
        testCases: { create: testCases },
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
