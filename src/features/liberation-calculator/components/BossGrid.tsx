import { useMemo } from 'react';
import { BossCard } from './BossCard';
import { LIBERATION_BOSSES } from '../constants/liberationData';
import { BossClear, BossDifficulty } from '../types/liberation';

interface BossGridProps {
  bossesCleared: BossClear[];
  onUpdateBossClear: (bossId: string, difficulty: BossDifficulty, updates: Partial<BossClear>) => void;
  onAddBossClear: (bossClear: BossClear) => void;
  onRemoveBossClear: (bossId: string, difficulty: BossDifficulty) => void;
}

export const BossGrid = ({
  bossesCleared,
  onUpdateBossClear,
  onAddBossClear,
  onRemoveBossClear
}: BossGridProps) => {
  const bossesWithClears = useMemo(() => {
    return LIBERATION_BOSSES.map(boss => ({
      boss,
      bossClear: bossesCleared.find(clear => clear.bossId === boss.id)
    }));
  }, [bossesCleared]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bossesWithClears.map(({ boss, bossClear }) => (
        <BossCard
          key={boss.id}
          boss={boss}
          bossClear={bossClear}
          onUpdate={onUpdateBossClear}
          onAdd={onAddBossClear}
          onRemove={onRemoveBossClear}
        />
      ))}
    </div>
  );
};
