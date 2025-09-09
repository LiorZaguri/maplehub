import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { getBossMeta } from '@/lib/bossData';
import { getAssetUrl } from '@/lib/utils';
import {
  LIBERATION_LABELS,
  GENESIS_PASS_OPTIONS,
  QUEST_OPTIONS,
  MAGNIFICATION_OPTIONS,
  DIFFICULTY_OPTIONS,
  PARTY_SIZES
} from '../constants';
import { LiberationCalculatorInputs } from '../types';
import { BossTableRow } from './BossTableRow';
import { Info } from 'lucide-react';

interface LiberationInputsProps {
  inputs: LiberationCalculatorInputs;
  onUpdate: (field: keyof LiberationCalculatorInputs, value: any) => void;
  onBossUpdate: (index: number, field: string, value: any) => void;
  onReset?: () => void;
}

export const LiberationInputs = ({ inputs, onUpdate, onBossUpdate, onReset }: LiberationInputsProps) => {
  // Function to get boss image for current quest
  const getBossImage = (questValue: string) => {
    // Extract boss name from quest value (format: "traces|Boss Name")
    const bossName = questValue.split('|')[1];
    
    // Map simple boss names to their "Normal" difficulty versions for image lookup
    const bossNameMap: Record<string, string> = {
      'Lotus': 'Normal Lotus',
      'Damien': 'Normal Damien',
      'Lucid': 'Normal Lucid',
      'Will': 'Normal Will',
      'Gloom': 'Normal Gloom',
      'Darknell': 'Normal Darknell',
      'Verus Hilla': 'Normal Verus Hilla',
      'Black Mage': 'Hard Black Mage',
      'Von Leon': 'Normal Von Leon',
      'Arkarium': 'Normal Arkarium',
      'Magnus': 'Normal Magnus'
    };
    
    const fullBossName = bossNameMap[bossName] || bossName;
    const bossMeta = getBossMeta(fullBossName);
    if (bossMeta) {
      return getAssetUrl(bossMeta.imageUrl);
    }
    return getAssetUrl('bosses/placeholder.png');
  };

  // Get current quest boss name for display
  const getCurrentQuestBoss = () => {
    const questValue = inputs.liberationQuest;
    if (!questValue || questValue === 'none') return null;
    const bossName = questValue.split('|')[1];
    return bossName;
  };

  return (
    <div className="space-y-4">
      {/* Configuration Section */}
      <Card className="relative overflow-hidden">
        {/* Boss Background for entire Configuration card */}
        {getCurrentQuestBoss() && (
          <div 
            className="absolute bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getBossImage(inputs.liberationQuest)})`,
              backgroundSize: 'auto 200%',
              backgroundPosition: 'left',
              backgroundRepeat: 'no-repeat',
              top: 0,
              left: -10,
              width: '100%',
              height: '100%',
              maskImage: 'linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 40%, rgba(255, 0, 0, 0) 70%, rgb(255, 0, 0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 40%, rgba(255, 0, 0, 0) 70%, rgb(255, 0, 0) 100%)',
              opacity: 0.2
            }}
          />
        )}
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold">Configuration</h4>
            {onReset && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReset}
                className="text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Quest */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Current quest</Label>
              <Select value={inputs.liberationQuest} onValueChange={(value) => onUpdate('liberationQuest', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder={LIBERATION_LABELS.QUEST_SELECTION} />
                </SelectTrigger>
                <SelectContent>
                  {QUEST_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded overflow-hidden bg-muted/20 flex items-center justify-center flex-shrink-0">
                          <img 
                            src={getBossImage(option.value)}
                            alt={option.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getAssetUrl('bosses/placeholder.png');
                            }}
                          />
                        </div>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Traces of Darkness Held */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Traces of darkness held</Label>
              <Input
                type="number"
                min="0"
                max="3000"
                value={inputs.currentTraces}
                onChange={(e) => onUpdate('currentTraces', Number(e.target.value))}
                placeholder={LIBERATION_LABELS.TRACES_RANGE}
                className="h-8"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Start date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={inputs.startDate}
                  onChange={(e) => onUpdate('startDate', e.target.value)}
                  className="h-8 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:border [&::-webkit-calendar-picker-indicator]:border-gray-300"
                />
              </div>
            </div>

            {/* Genesis Pass */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Genesis Pass</Label>
              <Select value={inputs.genesisPass} onValueChange={(value) => onUpdate('genesisPass', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Genesis Pass" />
                </SelectTrigger>
                <SelectContent>
                  {GENESIS_PASS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boss Selection Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-lg font-semibold">Boss Selection</h4>
            </div>
            <Badge variant="outline" className="text-xs">
              {inputs.bossSelections.filter(boss => boss.isClearing).length} / {inputs.bossSelections.length} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground mb-3 px-3">
              <div className="flex items-center space-x-2">
                <span>{LIBERATION_LABELS.BOSS}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{LIBERATION_LABELS.DIFFICULTY_LEVEL}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{LIBERATION_LABELS.PARTY_MEMBERS}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{LIBERATION_LABELS.CLEAR_OR_NOT}</span>
              </div>
            </div>

            {/* Boss Rows */}
            <div className="space-y-1 border border-border rounded-lg overflow-hidden">
              {inputs.bossSelections.map((boss, index) => (
                <BossTableRow
                  key={boss.bossName}
                  boss={{
                    bossName: boss.bossName,
                    difficulty: boss.difficulty,
                    partySize: boss.partySize,
                    isClearing: boss.isClearing,
                    weeklyShare: boss.weeklyShare,
                  }}
                  onUpdate={(field, value) => onBossUpdate(index, field, value)}
                  genesisPass={inputs.genesisPass}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
