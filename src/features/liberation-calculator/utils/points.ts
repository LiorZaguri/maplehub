import { BOSS_TRACES } from '../constants/liberationData';
import { BossSelection } from '../constants/types';

/** Compute traces for one boss selection after party split & Genesis Pass. */
export function tracesForSelection(sel: BossSelection, useGenesisPass = false): number {
  if (!sel.include) return 0;
  const perKill = BOSS_TRACES[sel.bossId]?.[sel.difficulty] ?? 0;
  const party = Math.max(1, Math.floor(sel.partySize || 1));
  const passMultiplier = useGenesisPass ? 3 : 1; // :contentReference[oaicite:5]{index=5}
  return Math.floor(perKill / party) * passMultiplier;
}

/** Sums weekly (non–Black Mage) and monthly (Black Mage) traces. */
export function splitWeeklyMonthly(
  selections: BossSelection[],
  useGenesisPass = false
): { weekly: number; monthly: number } {
  let weekly = 0;
  let monthly = 0;

  for (const sel of selections) {
    if (!sel.include) continue;
    // Include all bosses in weekly/monthly income regardless of cleared status
    
    const amount = tracesForSelection(sel, useGenesisPass);
    if (sel.bossId === 'Black Mage') monthly += amount;
    else weekly += amount;
  }
  return { weekly, monthly };
}

/** Add this week's uncleared runs to a starting total. */
export function addUnclearedThisWeek(
  selections: BossSelection[],
  useGenesisPass = false,
  start = 0
): number {
  let total = start;
  for (const sel of selections) {
    if (!sel.include) continue;
    if (!sel.alreadyCleared) {
      // If not cleared, add traces to starting total (will get this week/month)
      total += tracesForSelection(sel, useGenesisPass);
    }
    // If already cleared, don't add to starting total (already earned)
  }
  return total;
}