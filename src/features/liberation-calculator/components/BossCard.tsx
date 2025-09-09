import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BossInfo, BossDifficulty, BossClear } from '../types/liberation';
import { getBossInfo } from '../utils/calculationUtils';

interface BossCardProps {
  boss: BossInfo;
  bossClear?: BossClear;
  onUpdate: (bossId: string, difficulty: BossDifficulty, updates: Partial<BossClear>) => void;
  onAdd: (bossClear: BossClear) => void;
  onRemove: (bossId: string, difficulty: BossDifficulty) => void;
}

export const BossCard = ({ boss, bossClear, onUpdate, onAdd, onRemove }: BossCardProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<BossDifficulty>(
    bossClear?.difficulty || boss.availableDifficulties[0]
  );

  const handleDifficultyChange = (difficulty: BossDifficulty) => {
    setSelectedDifficulty(difficulty);
    if (bossClear) {
      onUpdate(boss.id, bossClear.difficulty, { difficulty });
    }
  };

  const handleClearedToggle = (clearedThisWeek: boolean) => {
    if (!bossClear) {
      // Add new boss clear
      const newBossClear: BossClear = {
        bossId: boss.id,
        difficulty: selectedDifficulty,
        clearedThisWeek,
        partySize: boss.partySize
      };
      onAdd(newBossClear);
    } else {
      // Update existing boss clear
      onUpdate(boss.id, bossClear.difficulty, { clearedThisWeek });
    }
  };

  const handleRemove = () => {
    if (bossClear) {
      onRemove(boss.id, bossClear.difficulty);
    }
  };

  const currentReward = boss.traceRewards[selectedDifficulty] || 0;
  const isConfigured = !!bossClear;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{boss.name}</CardTitle>
          <Badge variant={isConfigured ? "default" : "secondary"}>
            {isConfigured ? "Configured" : "Not Set"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Difficulty Selection */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Difficulty:</label>
          <Select
            value={selectedDifficulty}
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {boss.availableDifficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-sm">
            {currentReward} traces
          </Badge>
        </div>

        {/* Party Size */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Party Size:</label>
          <Badge variant="outline">
            {boss.partySize} players
          </Badge>
        </div>

        {/* Clear Limits */}
        {(boss.weeklyClearLimit || boss.monthlyClearLimit) && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Limits:</label>
            <div className="flex gap-2">
              {boss.weeklyClearLimit && (
                <Badge variant="destructive" className="text-xs">
                  Weekly: {boss.weeklyClearLimit}
                </Badge>
              )}
              {boss.monthlyClearLimit && (
                <Badge variant="destructive" className="text-xs">
                  Monthly: {boss.monthlyClearLimit}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Clear Toggle */}
        <div className="flex items-center gap-3">
          <Checkbox
            id={`${boss.id}-cleared`}
            checked={bossClear?.clearedThisWeek || false}
            onCheckedChange={handleClearedToggle}
          />
          <label
            htmlFor={`${boss.id}-cleared`}
            className="text-sm font-medium cursor-pointer"
          >
            Cleared This Week
          </label>
        </div>

        {/* Remove Button */}
        {isConfigured && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="w-full mt-3"
          >
            Remove Configuration
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
