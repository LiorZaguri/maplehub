import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gem, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { HEXASkill, SkillType } from '../types';
import { getTotalCost } from '../utils/costTables';

interface SkillRowProps {
  skill: HEXASkill;
  onCurrentLevelChange: (level: number) => void;
  onTargetLevelChange: (level: number) => void;
  isDisabled?: boolean;
}

const skillTypeColors: Record<SkillType, string> = {
  'Origin': 'bg-purple-100 text-purple-800 border-purple-200',
  'Mastery': 'bg-blue-100 text-blue-800 border-blue-200',
  'Boost': 'bg-orange-100 text-orange-800 border-orange-200',
  'Hexa Stat': 'bg-green-100 text-green-800 border-green-200',
  'Common': 'bg-gray-100 text-gray-800 border-gray-200',
};

export const SkillRow = ({
  skill,
  onCurrentLevelChange,
  onTargetLevelChange,
  isDisabled = false
}: SkillRowProps) => {
  const [currentLevel, setCurrentLevel] = useState(skill.currentLevel.toString());
  const [targetLevel, setTargetLevel] = useState(skill.targetLevel.toString());

  // Sync local state with skill prop changes
  useEffect(() => {
    setCurrentLevel(skill.currentLevel.toString());
    setTargetLevel(skill.targetLevel.toString());
  }, [skill.currentLevel, skill.targetLevel]);

  const progressPercentage = skill.targetLevel > 0 ? (skill.currentLevel / skill.targetLevel) * 100 : 0;
  const isComplete = skill.isComplete;
  const costs = getTotalCost(skill.skillType, skill.currentLevel, skill.targetLevel);
  const hasCosts = costs.solErda > 0 || costs.fragments > 0;
  
  // Disable Ascent skill as it's not working yet (it's always the 10th skill - index 9)
  const isAscentDisabled = skill.id.includes('-skill-10');
  
  // Sol Janus is active but not in leveling order (Hexa Stat is in the order)
  const isNotInLevelingOrder = skill.name === 'Sol Janus';

  const handleCurrentLevelChange = (value: string) => {
    if (isAscentDisabled) {
      // Force disabled skills to always have level 0
      setCurrentLevel('0');
      onCurrentLevelChange(0);
      return;
    }
    const level = Math.max(0, Math.min(skill.maxLevel, parseInt(value) || 0));
    setCurrentLevel(level.toString());
    onCurrentLevelChange(level);
  };

  const handleTargetLevelChange = (value: string) => {
    if (isAscentDisabled) {
      // Force disabled skills to always have level 0
      setTargetLevel('0');
      onTargetLevelChange(0);
      return;
    }
    const level = Math.max(0, Math.min(skill.maxLevel, parseInt(value) || 0));
    setTargetLevel(level.toString());
    onTargetLevelChange(level);
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors bg-card hover:bg-muted/50 ${
      isDisabled || isAscentDisabled ? 'opacity-50' : ''
    } ${isAscentDisabled ? 'border-dashed border-orange-300 bg-orange-50' : ''}`}>
        {/* Skill Icon */}
        <div className="relative flex-shrink-0">
          <img
            src={`/skill-images/${skill.icon}`}
            alt={skill.name}
            className="w-8 h-8 rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          {isComplete && (
            <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-600 bg-white rounded-full" />
          )}
        </div>

        {/* Skill Name and Cost - Responsive */}
        <div className="flex-1 min-w-0 max-w-[200px] xl:max-w-none">
          {isAscentDisabled ? (
            <p className="text-xs text-orange-600 font-medium">
              Coming Soon
            </p>
          ) : (
            <div className="space-y-1">
              {/* Skill Name - Always visible */}
              <p className="text-xs font-medium text-foreground truncate">
                {skill.name}
              </p>
              {/* Fragment and Sol Erda Cost - Responsive display */}
              <div className="block">
                {hasCosts ? (
                  <div className="text-xs text-muted-foreground truncate">
                    <p>
                      <span className="hidden sm:inline">{costs.fragments.toLocaleString()} Fragments</span>
                      <span className="sm:hidden">{costs.fragments.toLocaleString()}</span>
                    </p>
                    {costs.solErda > 0 && (
                      <p>
                        <span className="hidden sm:inline">{costs.solErda.toLocaleString()} Sol Erda</span>
                        <span className="sm:hidden">{costs.solErda.toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-green-600 font-medium">
                    Complete
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Level */}
        <div className="w-12 sm:w-16">
          <Input
            type="number"
            value={isAscentDisabled ? '0' : currentLevel}
            onChange={(e) => handleCurrentLevelChange(e.target.value)}
            min="0"
            max={skill.maxLevel}
            className="h-8 text-center text-xs"
            disabled={isDisabled || isAscentDisabled}
          />
        </div>

        {/* Arrow */}
        <div className="text-muted-foreground text-xs sm:text-sm">→</div>

        {/* Target Level */}
        <div className="w-12 sm:w-16">
          <Input
            type="number"
            value={isAscentDisabled ? '0' : targetLevel}
            onChange={(e) => handleTargetLevelChange(e.target.value)}
            min="0"
            max={skill.maxLevel}
            className="h-8 text-center text-xs"
            disabled={isDisabled || isAscentDisabled}
          />
        </div>

        {/* Progress */}
        <div className="w-20 sm:w-32">
          <Progress 
            value={Math.min(progressPercentage, 100)} 
            className="h-2"
          />
        </div>
      </div>
    );
  }

