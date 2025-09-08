import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

import { getBossMeta, getMaxPartySize } from '@/lib/bossData';
import { 
  RosterCharacter,
  CharacterBossProgress,
  useBossTracker,
  BossStats,
  BossTrackerHeader,
  BossFilters,
  CharacterBossCard,
  CharacterReorderDialog
} from '@/features/boss-tracker';



const BossTracker = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use the centralized boss tracker hook
  const {
    roster,
    filteredCharacters,
    progressByCharacter,
    enabledByCharacter,
    tempDisabledByCharacter,
    partyByCharacter,
    weeklyBosses,
    dailyBosses,
    monthlyBosses,
    bossFilter,
    isLoadingOrder,
    timeUntilReset,
    SHOW_BOSS_ICONS,
    setBossFilter,
    toggleBossComplete,
    resetAllProgress,
    saveCharacterOrderToStorage,
    setPartyByCharacter,
    setProgressByCharacter,
    setRoster,
    getPartySize,
    getWeeklyBossCount,
    isBossEnabledForCharacter,
    isBossTempDisabledForCharacter,
    getCompletionStats,
    getCollectedValue,
    getMaxPossibleValue,
  } = useBossTracker();


  // UI state for reorder dialog and party size editing
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [reorderCharacters, setReorderCharacters] = useState<RosterCharacter[]>([]);
  const [editingPartySize, setEditingPartySize] = useState<{ characterName: string; bossName: string } | null>(null);
  const [partySizeInput, setPartySizeInput] = useState<string>('');

  const openBossEditor = (characterName: string) => {
    // Navigate to Roster page and auto-open Edit Bosses dialog for this character
    navigate(`/?editBosses=${encodeURIComponent(characterName)}`);
  };

  // Party size editing functions
  const startEditingPartySize = (characterName: string, bossName: string) => {
    const currentSize = getPartySize(characterName, bossName);
    setPartySizeInput(currentSize.toString());
    setEditingPartySize({ characterName, bossName });
  };

  const savePartySize = () => {
    if (!editingPartySize) return;

    const { characterName, bossName } = editingPartySize;
    const newSize = parseInt(partySizeInput);
    const maxPartySize = getMaxPartySize(bossName);

    if (isNaN(newSize) || newSize < 1 || newSize > maxPartySize) {
      toast({
        title: 'Invalid Party Size',
        description: `Party size must be between 1 and ${maxPartySize} for ${bossName}.`,
        variant: 'destructive'
      });
      return;
    }

    setPartyByCharacter((prev) => ({
      ...prev,
      [characterName]: {
        ...prev[characterName],
        [bossName]: newSize,
      },
    }));

    setEditingPartySize(null);
    setPartySizeInput('');
  };

  const cancelPartySizeEdit = () => {
    setEditingPartySize(null);
    setPartySizeInput('');
  };

  const handlePartySizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      savePartySize();
    } else if (e.key === 'Escape') {
      cancelPartySizeEdit();
    }
  };



  return (
    <Layout>
      <div className="space-y-6">
        <BossTrackerHeader
          onReorderClick={() => {
              // Load current character order for reordering (preserve current order)
              setReorderCharacters([...roster]);
              setShowReorderDialog(true);
            }}
          onResetAll={resetAllProgress}
        />

        <BossStats
          roster={roster}
          weeklyBosses={weeklyBosses}
          dailyBosses={dailyBosses}
          monthlyBosses={monthlyBosses}
          progressByCharacter={progressByCharacter}
          enabledByCharacter={enabledByCharacter}
          partyByCharacter={partyByCharacter}
          getCollectedValue={getCollectedValue}
          getMaxPossibleValue={getMaxPossibleValue}
          getWeeklyBossCount={getWeeklyBossCount}
          timeUntilReset={timeUntilReset}
        />

      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="flex items-center justify-between">
            <BossFilters
              bossFilter={bossFilter}
              setBossFilter={setBossFilter}
            />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {(() => {
            // Show loading state while order is loading
            if (isLoadingOrder) {
              return Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="card-gaming">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                      <div className="min-w-0 flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {Array.from({ length: 3 }, (_, j) => (
                        <div key={j} className="h-8 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ));
            }

            if (roster.length === 0) {
              return (
                <Card className="card-gaming">
                  <CardContent className="pt-6">Add characters in Roster to start tracking.</CardContent>
                </Card>
              );
            }

            const bosses = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];

            return filteredCharacters.map((c) => {
            const stats = getCompletionStats(c.name, bosses);
            const visibleBosses = bosses.filter((b) => isBossEnabledForCharacter(c.name, b.name));
            // For check all button state, only consider weekly/daily bosses since monthly are excluded from check all
            const weeklyDailyBosses = visibleBosses.filter(b => !monthlyBosses.some(mb => mb.name === b.name));
            const allChecked = weeklyDailyBosses.length > 0 && weeklyDailyBosses.every(b => (progressByCharacter[c.name] || {})[b.name]);
            
            return (
                <CharacterBossCard
                  key={c.id}
                  character={c}
                  visibleBosses={visibleBosses}
                  monthlyBosses={monthlyBosses}
                  progressByCharacter={progressByCharacter}
                  completionStats={stats}
                  allBossesChecked={allChecked}
                  editingPartySize={editingPartySize}
                  partySizeInput={partySizeInput}
                  showBossIcons={SHOW_BOSS_ICONS}
                  onToggleBossComplete={toggleBossComplete}
                  onToggleAllBosses={(characterName, checkAll) => {
                    setProgressByCharacter((prev) => {
                      const current = prev[characterName] || {};
                      const updated: CharacterBossProgress = { ...current };
                      // Only toggle weekly and daily bosses, exclude monthly bosses
                      const weeklyDailyBosses = visibleBosses.filter(b =>
                        !monthlyBosses.some(mb => mb.name === b.name)
                      );
                      weeklyDailyBosses.forEach(b => { updated[b.name] = checkAll; });
                      return { ...prev, [characterName]: updated };
                    });
                  }}
                  onEditBosses={openBossEditor}
                  onStartEditingPartySize={startEditingPartySize}
                  onPartySizeInputChange={setPartySizeInput}
                  onPartySizeKeyDown={handlePartySizeKeyDown}
                  onPartySizeBlur={savePartySize}
                  getPartySize={getPartySize}
                  getWeeklyBossCount={getWeeklyBossCount}
                  isBossEnabledForCharacter={isBossEnabledForCharacter}
                  isBossTempDisabledForCharacter={isBossTempDisabledForCharacter}
                  getCollectedValue={getCollectedValue}
                  getMaxPossibleValue={getMaxPossibleValue}
                />
            );
          });
        })()}
        </div>
      </div>

        <CharacterReorderDialog
          open={showReorderDialog}
          onOpenChange={setShowReorderDialog}
          characters={reorderCharacters}
          onCharactersChange={setReorderCharacters}
          onSave={() => {
            // Save the new order using the hook's function
                  const characterOrder = reorderCharacters.map(c => c.id);
            saveCharacterOrderToStorage(characterOrder);

                  setShowReorderDialog(false);
                  setReorderCharacters([]);

                  toast({
                    title: "Order Updated",
                    description: "Character order has been saved for Boss Tracker",
                    className: "progress-complete",
                    duration: 4000
                  });
                }}
          onCancel={() => {
            setShowReorderDialog(false);
            setReorderCharacters([]);
          }}
        />
      </div>
    </Layout>
  );
};

export default BossTracker;
