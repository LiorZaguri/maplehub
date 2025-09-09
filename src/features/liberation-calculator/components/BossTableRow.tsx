import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PARTY_SIZES, LIBERATION_LABELS, BOSS_DATA } from '../constants';
import { BossTableRow as BossTableRowType } from '../types';
import { Users } from 'lucide-react';

interface BossTableRowProps {
  boss: BossTableRowType;
  onUpdate: (field: keyof BossTableRowType, value: any) => void;
  genesisPass?: string;
}

export const BossTableRow = ({ boss, onUpdate, genesisPass = 'no' }: BossTableRowProps) => {
  // Calculate traces based on difficulty, party size, and genesis pass
  const calculateTraces = () => {
    const bossData = BOSS_DATA.find(b => b.name === boss.bossName);
    if (!bossData) return 0;

    const difficultyData = bossData.difficulties.find(d => d.label === boss.difficulty);
    if (!difficultyData) return 0;

    const baseTraces = difficultyData.baseTraces;
    const partySize = Math.max(1, boss.partySize);
    const genesisMultiplier = genesisPass === 'yes' ? 3 : 1;
    
    return Math.floor((baseTraces / partySize) * genesisMultiplier);
  };

  const handleDifficultyChange = (difficulty: string) => {
    onUpdate('difficulty', difficulty);
  };

  const handlePartySizeChange = (partySize: string) => {
    const size = Number(partySize);
    onUpdate('partySize', size);
  };

  const handleClearingChange = (isClearing: boolean) => {
    onUpdate('isClearing', isClearing);
  };

  const getBossImage = (bossName: string) => {
    // Map boss names to their image files
    const bossImageMap: Record<string, string> = {
      'Lotus': 'bosses/lotus.png',
      'Damien': 'bosses/damien.png', 
      'Lucid': 'bosses/lucid.png',
      'Will': 'bosses/will.png',
      'Gloom': 'bosses/gloom.png',
      'Verus Hilla': 'bosses/verus-hilla.png',
      'Darknell': 'bosses/darknell.png',
      'Black Mage': 'bosses/black-mage.png'
    };
    return bossImageMap[bossName] || 'placeholder.svg';
  };

  const getAvailableDifficulties = () => {
    const bossData = BOSS_DATA.find(b => b.name === boss.bossName);
    return bossData?.difficulties || [];
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-card hover:bg-muted/30 transition-colors border-b border-border/50 last:border-b-0">
      {/* Boss Info */}
      <div className="flex items-center space-x-3">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center flex-shrink-0">
          <img 
            src={`/${getBossImage(boss.bossName)}`}
            alt={boss.bossName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-primary/20 rounded-lg flex items-center justify-center hidden">
            <span className="text-xs font-bold text-primary">
              {boss.bossName.charAt(0)}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{boss.bossName}</div>
          <div className="text-xs text-muted-foreground">
            {calculateTraces()} traces
          </div>
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="flex items-center">
        <Select value={boss.difficulty} onValueChange={handleDifficultyChange}>
          <SelectTrigger className="w-full h-9">
            <SelectValue placeholder={LIBERATION_LABELS.SELECTION} />
          </SelectTrigger>
          <SelectContent>
            {getAvailableDifficulties().map((difficulty) => (
              <SelectItem key={difficulty.label} value={difficulty.label}>
                {difficulty.label} ({difficulty.baseTraces} traces)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Party Members */}
      <div className="flex items-center">
        <Select value={boss.partySize.toString()} onValueChange={handlePartySizeChange}>
          <SelectTrigger className="w-full h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PARTY_SIZES.map(size => (
              <SelectItem key={size} value={size.toString()}>
                <div className="flex items-center space-x-2">
                  <Users className="w-3 h-3" />
                  <span>{size === 1 ? 'Solo' : `${size} members`}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Status */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={boss.isClearing}
            onCheckedChange={handleClearingChange}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {boss.bossName === 'Black Mage' ? 'Already cleared this month' : LIBERATION_LABELS.STATES_LIVER}
          </span>
        </div>
      </div>
    </div>
  );
};
