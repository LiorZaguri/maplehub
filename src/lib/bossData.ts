// Structured boss data
import { bosses, type BossEntry } from '@/data/bosses';

export type BossMeta = BossEntry;

// Memoize the config map to avoid recreating it on every call
const configMap = new Map<string, BossMeta>();
if (configMap.size === 0) {
  bosses.forEach((b) => configMap.set(b.name, b));
}

export function getBossMeta(combinedName: string): BossMeta | undefined {
  return configMap.get(combinedName.trim());
}

export function formatMesos(amount: number): string {
  return amount.toLocaleString();
}

// Cache the boss list to avoid recreating arrays
let cachedBossList: BossMeta[] | null = null;

export function listAllBosses(): BossMeta[] {
  if (cachedBossList === null) {
    cachedBossList = Array.from(configMap.values());
  }
  return cachedBossList;
}


