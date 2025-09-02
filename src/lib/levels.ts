// Use structured table instead of parsing raw text
import { expData as expPairs } from '@/data/levels';
const levelToExp = new Map<number, number | 'N/A'>(expPairs);

export function getExpForLevel(level: number): number | 'N/A' | undefined {
  return levelToExp.get(level);
}

export function getLevelProgress(level: number, currentExp: number): number {
  const needed = levelToExp.get(level) as number | 'N/A' | undefined;
  if (!needed || needed === 'N/A') return 100;
  const pct = Math.max(0, Math.min(100, Math.round((currentExp / needed) * 100)));
  return pct;
}


