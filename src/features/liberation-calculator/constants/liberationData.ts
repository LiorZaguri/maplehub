import { BossId, Difficulty, QuestStage } from './types';

/** Matches your existing numbers & goal. */
export const LIBERATION_GOAL = 6500; // :contentReference[oaicite:1]{index=1}
export const DEFAULT_WEEKLY_RESET_DAY = 4; // Thursday (0=Sun)  :contentReference[oaicite:2]{index=2}

/** Base traces granted by the current quest stage (mapped to your UI labels). */
export const QUEST_BASE: Record<QuestStage, number> = {
  None: 0,              // "반 레온" in your original code
  Arkarium: 500,        // 아카이럼
  Magnus: 1000,         // 매그너스
  Lotus: 1500,          // 스우
  Damien: 2500,         // 데미안
  Will: 3500,           // 윌
  Lucid: 4500,          // 루시드
  'Verus Hilla': 5500,  // 진 힐라
}; // :contentReference[oaicite:3]{index=3}

/** Traces per boss per difficulty (weekly, except Black Mage which is monthly). */
export const BOSS_TRACES: Record<BossId, Partial<Record<Difficulty, number>>> = {
  Lotus: { Normal: 10, Hard: 50, Extreme: 50 },
  Damien: { Normal: 10, Hard: 50 },
  Lucid: { Easy: 15, Normal: 20, Hard: 65 },
  Will: { Easy: 15, Normal: 25, Hard: 75 },
  Gloom: { Normal: 20, Chaos: 65 },           // 더스크
  'Verus Hilla': { Normal: 45, Hard: 90 },
  Darknell: { Normal: 25, Hard: 75 },
  'Black Mage': { Hard: 600, Extreme: 600 },  // monthly
}; // :contentReference[oaicite:4]{index=4}
