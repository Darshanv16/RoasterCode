export function xpForLevel(level: number): number {
  return (level - 1) ** 2 * 100;
}

export function getXpProgress(xp: number, level: number) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progress = nextLevelXp > currentLevelXp
    ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    : 100;
  return {
    current: xp - currentLevelXp,
    max: nextLevelXp - currentLevelXp,
    percent: Math.min(100, Math.max(0, progress)),
  };
}
