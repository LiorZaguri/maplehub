import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { getBossMeta, formatMesos, getMaxPartySize } from '@/lib/bossData';
import CharacterCard from '@/components/CharacterCard';
import { getCharacterWorldMultiplier } from '../utils/bossUtils';
import { RosterCharacter, BossInfo, CharacterBossProgress, CompletionStats } from '../types/bossTracker';

interface CharacterBossCardProps {
  character: RosterCharacter;
  visibleBosses: BossInfo[];
  monthlyBosses: BossInfo[];
  progressByCharacter: Record<string, CharacterBossProgress>;
  completionStats: CompletionStats;
  allBossesChecked: boolean;
  editingPartySize: { characterName: string; bossName: string } | null;
  partySizeInput: string;
  showBossIcons: boolean;
  onToggleBossComplete: (characterName: string, bossName: string) => void;
  onToggleAllBosses: (characterName: string, checkAll: boolean) => void;
  onEditBosses: (characterName: string) => void;
  onStartEditingPartySize: (characterName: string, bossName: string) => void;
  onPartySizeInputChange: (value: string) => void;
  onPartySizeKeyDown: (e: React.KeyboardEvent) => void;
  onPartySizeBlur: () => void;
  getPartySize: (characterName: string, bossName: string) => number;
  getWeeklyBossCount: (characterName: string) => number;
  isBossEnabledForCharacter: (characterName: string, bossName: string) => boolean;
  isBossTempDisabledForCharacter: (characterName: string, bossName: string) => boolean;
  getCollectedValue: (characterName: string, bossList: BossInfo[]) => number;
  getMaxPossibleValue: (characterName: string, bossList: BossInfo[]) => number;
}

export const CharacterBossCard = ({
  character,
  visibleBosses,
  monthlyBosses,
  progressByCharacter,
  completionStats,
  allBossesChecked,
  editingPartySize,
  partySizeInput,
  showBossIcons,
  onToggleBossComplete,
  onToggleAllBosses,
  onEditBosses,
  onStartEditingPartySize,
  onPartySizeInputChange,
  onPartySizeKeyDown,
  onPartySizeBlur,
  getPartySize,
  getWeeklyBossCount,
  isBossEnabledForCharacter,
  isBossTempDisabledForCharacter,
  getCollectedValue,
  getMaxPossibleValue,
}: CharacterBossCardProps) => {
  // For check all button state, only consider weekly/daily bosses since monthly are excluded from check all
  const weeklyDailyBosses = visibleBosses.filter(b => !monthlyBosses.some(mb => mb.name === b.name));

  return (
    <div className="space-y-3">
      <CharacterCard
        character={character}
        variant="boss-tracker"
        completionStats={completionStats}
        allBossesChecked={allBossesChecked}
        onToggleAllBosses={(characterName, checkAll) => onToggleAllBosses(characterName, checkAll)}
        onEditBosses={(characterName) => onEditBosses(characterName)}
      />
      
      {/* Boss list content below the card */}
      <Card className="card-gaming">
        <CardContent className="p-3">
          <div className="overflow-x-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <Table className="w-full table-fixed text-sm leading-tight">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-6 p-0.5"></TableHead>
                    <TableHead className="p-0.5">Boss</TableHead>
                    <TableHead className="w-10 md:w-14 text-center p-0.5">Party</TableHead>
                    <TableHead className="w-24 md:w-28 text-right p-0.5">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...visibleBosses]
                    .sort((a, b) => {
                      const aVal = Math.floor(a.value / getPartySize(character.name, a.name));
                      const bVal = Math.floor(b.value / getPartySize(character.name, b.name));
                      return bVal - aVal || a.name.localeCompare(b.name); // tie-break by name
                    })
                    .map((boss) => {
                      const meta = getBossMeta(boss.name);
                      const isDisabled = isBossTempDisabledForCharacter(character.name, boss.name);
                      const isChecked = (progressByCharacter[character.name] || {})[boss.name] || false;
                      const weeklyCount = getWeeklyBossCount(character.name);
                      const canCheck = !isDisabled && (weeklyCount < 14 || isChecked);

                      return (
                        <TableRow
                          key={boss.name}
                          className={`hover:bg-muted/50 h-7 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
                          onClick={() => !isDisabled && onToggleBossComplete(character.name, boss.name)}
                        >
                          <TableCell className="p-0">
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isChecked}
                                disabled={!canCheck}
                                onCheckedChange={() => onToggleBossComplete(character.name, boss.name)}
                                className="h-4 w-4 data-[state=checked]:bg-success data-[state=checked]:border-success"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-primary p-0">
                            <div className="flex items-center gap-1 min-w-0">
                              {showBossIcons && meta?.imageUrl && (
                                <img
                                  src={meta.imageUrl}
                                  alt={boss.name}
                                  className={`h-6 w-6 rounded-md ${isDisabled ? 'grayscale' : ''}`}
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const img = e.currentTarget as HTMLImageElement;
                                    if (img.src !== window.location.origin + '/placeholder.svg') {
                                      img.src = '/placeholder.svg';
                                    }
                                  }}
                                />
                              )}
                              <span className={`truncate whitespace-nowrap max-w-[120px] md:max-w-[170px] text-sm ${isDisabled ? 'text-muted-foreground' : ''}`}>
                                {boss.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className={`text-center p-0 text-sm ${isDisabled ? 'text-muted-foreground' : ''}`}>
                            <div onClick={(e) => e.stopPropagation()}>
                              {editingPartySize?.characterName === character.name && editingPartySize?.bossName === boss.name ? (
                                <input
                                  id={`party-size-${character.name}-${boss.name}`}
                                  name={`party-size-${character.name}-${boss.name}`}
                                  type="number"
                                  value={partySizeInput}
                                  onChange={(e) => onPartySizeInputChange(e.target.value)}
                                  onKeyDown={onPartySizeKeyDown}
                                  onBlur={onPartySizeBlur}
                                  className="w-8 h-6 text-center text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                  min="1"
                                  max={getMaxPartySize(boss.name)}
                                  autoFocus
                                />
                              ) : (
                                <button
                                  onClick={() => onStartEditingPartySize(character.name, boss.name)}
                                  className="hover:bg-muted/50 px-1 py-0.5 rounded text-xs transition-colors"
                                  disabled={isDisabled}
                                >
                                  {getPartySize(character.name, boss.name)}
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={`text-right font-mono p-0 text-sm ${isDisabled ? 'text-muted-foreground' : ''}`}>
                            {formatMesos(Math.floor((boss.value / getPartySize(character.name, boss.name)) * getCharacterWorldMultiplier(character)))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  <TableRow className="hover:bg-muted/50 border-b-0 h-7">
                    <TableCell colSpan={2} className="text-right text-muted-foreground p-0 text-sm">Collected</TableCell>
                    <TableCell colSpan={2} className="text-right font-mono text-accent p-0 text-sm">
                      {formatMesos(getCollectedValue(character.name, visibleBosses))}
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50 border-b-0 h-7">
                    <TableCell colSpan={2} className="text-right text-muted-foreground p-0 text-sm">Max Possible</TableCell>
                    <TableCell colSpan={2} className="text-right font-mono p-0 text-sm">
                      {formatMesos(getMaxPossibleValue(character.name, visibleBosses))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
                
            {/* Mobile Cards */}
            <div className="sm:hidden space-y-2">
              {[...visibleBosses]
                .sort((a, b) => {
                  const aVal = Math.floor(a.value / getPartySize(character.name, a.name));
                  const bVal = Math.floor(b.value / getPartySize(character.name, b.name));
                  return bVal - aVal || a.name.localeCompare(b.name); // tie-break by name
                })
                .map((boss) => {
                  const meta = getBossMeta(boss.name);
                  const isDisabled = isBossTempDisabledForCharacter(character.name, boss.name);
                  const isChecked = (progressByCharacter[character.name] || {})[boss.name] || false;
                  const weeklyCount = getWeeklyBossCount(character.name);
                  const canCheck = !isDisabled && (weeklyCount < 14 || isChecked);

                  return (
                    <div
                      key={boss.name}
                      className={`flex items-center justify-between p-2 border rounded hover:bg-muted/50 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
                      onClick={() => !isDisabled && onToggleBossComplete(character.name, boss.name)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isChecked}
                            disabled={!canCheck}
                            onCheckedChange={() => onToggleBossComplete(character.name, boss.name)}
                            className="h-4 w-4 data-[state=checked]:bg-success data-[state=checked]:border-success"
                          />
                        </div>

                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          {showBossIcons && meta?.imageUrl && (
                            <img
                              src={meta.imageUrl}
                              alt={boss.name}
                              className={`h-6 w-6 rounded-md flex-shrink-0 ${isDisabled ? 'grayscale' : ''}`}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                if (img.src !== window.location.origin + '/placeholder.svg') {
                                  img.src = '/placeholder.svg';
                                }
                              }}
                            />
                          )}
                          <span className={`truncate whitespace-nowrap text-sm ${isDisabled ? 'text-muted-foreground' : ''}`}>
                            {boss.name}
                          </span>
                        </div>
                      </div>
                      <div className={`text-right text-xs ${isDisabled ? 'text-muted-foreground' : ''}`}>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs">Party:</span>
                          <div onClick={(e) => e.stopPropagation()}>
                            {editingPartySize?.characterName === character.name && editingPartySize?.bossName === boss.name ? (
                              <input
                                id={`party-size-mobile-${character.name}-${boss.name}`}
                                name={`party-size-mobile-${character.name}-${boss.name}`}
                                type="number"
                                value={partySizeInput}
                                onChange={(e) => onPartySizeInputChange(e.target.value)}
                                onKeyDown={onPartySizeKeyDown}
                                onBlur={onPartySizeBlur}
                                className="w-6 h-4 text-center text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                min="1"
                                max={getMaxPartySize(boss.name)}
                                autoFocus
                              />
                            ) : (
                              <button
                                onClick={() => onStartEditingPartySize(character.name, boss.name)}
                                className="hover:bg-muted/50 px-1 rounded text-xs transition-colors"
                                disabled={isDisabled}
                              >
                                {getPartySize(character.name, boss.name)}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="font-mono">
                          {formatMesos(Math.floor((boss.value / getPartySize(character.name, boss.name)) * getCharacterWorldMultiplier(character)))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
