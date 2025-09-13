import { useState, useEffect, useMemo, useRef } from 'react';
import { LiberationCalculatorHeader } from './LiberationCalculatorHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Star, Clock, Users, Settings, Plus } from 'lucide-react';
import { useRoster } from '@/features/roster/hooks/useRoster';
import { Character as RosterCharacter } from '@/features/roster/types/roster';
import { LiberationCharacter } from '../types';
import { useLiberationCalculatorLogic } from '../hooks/useLiberationCalculatorLogic';
import {
  LIBERATION_MESSAGES,
  LIBERATION_LABELS,
  BOSS_DATA,
  BLACK_MAGE_DIFFICULTIES,
  PARTY_SIZES
} from '../constants';
import {
  generateMockLiberationData,
  mapRosterToLiberationCharacter
} from '../utils';
import { LiberationInputs } from './LiberationInputs';
import { LiberationResults } from './LiberationResults';
import { LiberationStorageService } from '../services/storageService';


export const LiberationCalculator = () => {
  const { characters: rosterCharacters } = useRoster();
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [characterDataVersion, setCharacterDataVersion] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Liberation calculator logic - skeleton only
  const { inputs, calculation, updateInput, updateBossSelection, resetToDefaults } = useLiberationCalculatorLogic(activeCharacterId || undefined);

  // Update character data version when completion rate changes to refresh character mapping
  useEffect(() => {
    if (inputs.completionRate !== undefined) {
      // Use a small delay to prevent excessive updates
      const timeoutId = setTimeout(() => {
        setCharacterDataVersion(prev => prev + 1);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputs.completionRate]);

  // Load saved character IDs from localStorage on mount
  useEffect(() => {
    const savedCharacterIds = LiberationStorageService.loadSelectedCharacterIds();
    if (savedCharacterIds.length > 0) {
      setSelectedCharacterIds(savedCharacterIds);
      setActiveCharacterId(savedCharacterIds[0]);
    }
  }, []);

  // Save character IDs to localStorage whenever selectedCharacterIds changes
  useEffect(() => {
    LiberationStorageService.saveSelectedCharacterIds(selectedCharacterIds);
  }, [selectedCharacterIds]);

  // Handle horizontal mouse wheel scrolling
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    // Find the viewport element inside the ScrollArea
    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel events when the mouse is over the scroll area
      if (e.deltaY !== 0) {
        e.preventDefault();
        viewport.scrollLeft += e.deltaY;
      }
    };

    scrollArea.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      scrollArea.removeEventListener('wheel', handleWheel);
    };
  }, [selectedCharacterIds.length]);

  // Map roster characters to liberation characters with real liberation data
  // Only show characters that are level 255 or higher
  const characters: LiberationCharacter[] = useMemo(() => {
    return rosterCharacters
      .filter(char => char.level >= 255)
      .map((char) => {
        // Try to load real liberation data from localStorage
        const liberationData = LiberationStorageService.loadCharacterData(char.id);
        
        if (liberationData) {
          // Use real data if available
          return {
            ...char,
            bossProgress: 0, // TODO: Calculate from boss selections
            tracesCollected: liberationData.currentTraces,
            daysRemaining: 0, // TODO: Calculate from ETA
            completionRate: liberationData.completionRate
          };
        } else {
          // Fall back to mock data for new characters
          const mockLiberationData = generateMockLiberationData();
          return mapRosterToLiberationCharacter(char, mockLiberationData);
        }
      });
  }, [rosterCharacters, characterDataVersion]); // Regenerate when rosterCharacters or character data changes

  // Get selected characters by mapping IDs to full character data, preserving selection order
  const selectedCharacters: LiberationCharacter[] = selectedCharacterIds
    .map(id => characters.find(char => char.id === id))
    .filter((char): char is LiberationCharacter => char !== undefined);

  // Get active character by ID
  const activeCharacter: LiberationCharacter | null = activeCharacterId
    ? characters.find(char => char.id === activeCharacterId) || null
    : null;

  const handleCharacterSelect = (character: LiberationCharacter) => {
    // Check if character is already selected
    const isAlreadySelected = selectedCharacterIds.includes(character.id);

    if (!isAlreadySelected) {
      setSelectedCharacterIds(prev => [...prev, character.id]);
      // Set as active character if it's the first one
      if (selectedCharacterIds.length === 0) {
        setActiveCharacterId(character.id);
      }
    }
    setIsCharacterSheetOpen(false);
  };

  const handleCharacterRemove = (characterId: string) => {
    setSelectedCharacterIds(prev => prev.filter(id => id !== characterId));

    // If we're removing the active character, set a new active one
    if (activeCharacterId === characterId) {
      const remainingIds = selectedCharacterIds.filter(id => id !== characterId);
      setActiveCharacterId(remainingIds.length > 0 ? remainingIds[0] : null);
    }
  };

  const handleCharacterClick = (character: LiberationCharacter) => {
    setActiveCharacterId(character.id);
  };

  return (
    <>
      <LiberationCalculatorHeader />


      {/* Character Liberation Manager */}
      <div className="mt-6 space-y-6">

        {/* Selected Characters Display */}
        {selectedCharacters.length > 0 && (
          <ScrollArea ref={scrollAreaRef} className="w-full rounded-md whitespace-nowrap">
            <div className="flex w-max space-x-4 pb-4">
              {selectedCharacters.map((character) => {
                const isActive = activeCharacter?.id === character.id;
                return (
                  <div 
                    key={character.id} 
                    className={`shrink-0 w-80 p-4 rounded-lg border relative cursor-pointer transition-all hover:shadow-md ${
                      isActive 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleCharacterClick(character)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-muted/20 flex items-center justify-center">
                        {character.avatarUrl ? (
                          <img 
                            src={character.avatarUrl} 
                            alt={character.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Users className={`w-12 h-12 text-muted-foreground ${character.avatarUrl ? 'hidden' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{character.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {character.class} • Lv. {character.level}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                        {character.id === activeCharacterId && calculation && inputs.targetTraces > 0 && calculation.finalTraces !== undefined
                          ? Math.round((calculation.finalTraces / inputs.targetTraces) * 100)
                          : character.completionRate}% Complete
                        </div>
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the character click
                        handleCharacterRemove(character.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                      title="Remove character"
                    >
                      <span className="text-destructive text-sm">×</span>
                    </button>
                  </div>
                );
              })}
              
              {/* Add More Characters Button */}
              <Sheet open={isCharacterSheetOpen} onOpenChange={setIsCharacterSheetOpen}>
                <SheetTrigger asChild>
                  <div className="shrink-0 w-80 p-4 rounded-lg border border-dashed border-muted-foreground/30 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center">
                          <Plus className="w-6 h-6 text-muted-foreground/70" />
                        </div>
                               <div className="text-center">
                                 <div className="text-sm font-medium text-muted-foreground">{LIBERATION_MESSAGES.ADD_CHARACTER}</div>
                                 <div className="text-xs text-muted-foreground/70">
                                   {LIBERATION_MESSAGES.ADD_CHARACTER_DESCRIPTION}
                                 </div>
                               </div>
                      </div>
                    </div>
                  </div>
                </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Select Character</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {characters.length > 0 ? (
                    characters.map((character) => {
                      const isSelected = selectedCharacters.some(c => c.id === character.id);
                      return (
          <Card
                          key={character.id}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            isSelected ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => !isSelected && handleCharacterSelect(character)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted/20 flex items-center justify-center">
                                {character.avatarUrl ? (
                                  <img 
                                    src={character.avatarUrl} 
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <Users className={`w-12 h-12 text-muted-foreground ${character.avatarUrl ? 'hidden' : ''}`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{character.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {character.class} • Lv. {character.level}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {character.id === activeCharacterId && calculation && inputs.targetTraces > 0 && calculation.finalTraces !== undefined
                                    ? Math.round((calculation.finalTraces / inputs.targetTraces) * 100)
                                    : character.completionRate}% Complete
                    </div>
                                       {isSelected && (
                                         <div className="text-xs text-primary mt-1 font-medium">
                                           {LIBERATION_MESSAGES.ALREADY_SELECTED}
                                         </div>
                                       )}
                      </div>
                    </div>
            </CardContent>
          </Card>
                      );
                    })
                  ) : (
                         <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                           <Users className="w-16 h-16 text-muted-foreground/50" />
                           <div>
                             <h3 className="text-lg font-semibold">{LIBERATION_MESSAGES.NO_CHARACTERS_FOUND}</h3>
                             <p className="text-muted-foreground">
                               {LIBERATION_MESSAGES.NO_CHARACTERS_FOUND_DESCRIPTION}
                             </p>
                    </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}

        {/* Character Details */}
        {activeCharacter ? (
          <div className="space-y-6">
                   {/* Liberation Calculator */}
                   <div className="space-y-6">
                     {/* Header with Progress Overview */}
                     <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border/50 p-6">
                       <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                             <span className="text-lg">⚔️</span>
                           </div>
                           <div>
                             <h3 className="text-xl font-bold text-foreground">{LIBERATION_LABELS.LIBERATION_PROGRESS}</h3>
                             <p className="text-sm text-muted-foreground">Track your liberation journey</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-2xl font-bold text-primary">
                             {calculation ? Math.round((calculation.finalTraces / inputs.targetTraces) * 100) : 0}%
                           </div>
                           <div className="text-sm text-muted-foreground">Complete</div>
                         </div>
                       </div>
                       
                       {/* Progress Bar */}
                       <div className="w-full bg-muted/30 rounded-full h-2 mb-2">
                         <div
                           className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500 ease-out"
                           style={{ width: `${calculation ? Math.min(100, (calculation.finalTraces / inputs.targetTraces) * 100) : 0}%` }}
                         />
                       </div>
                       <div className="flex justify-between text-xs text-muted-foreground">
                         <span>{calculation?.finalTraces || 0} traces</span>
                         <span>Target: {inputs.targetTraces.toLocaleString()} traces</span>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                       {/* Inputs Section */}
                       <div className="xl:col-span-2">
                         <LiberationInputs
                           inputs={inputs}
                           onUpdate={updateInput}
                           onBossUpdate={updateBossSelection}
                           onReset={resetToDefaults}
                         />
                       </div>

                       {/* Results Section */}
                       <div className="xl:col-span-1">
                         <LiberationResults calculation={calculation} targetTraces={inputs.targetTraces} />
                       </div>
                     </div>
                   </div>

          </div>
        ) : (
          <Sheet open={isCharacterSheetOpen} onOpenChange={setIsCharacterSheetOpen}>
            <SheetTrigger asChild>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center justify-center h-64">
                         <div className="flex flex-col items-center space-y-4">
                           <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                             <Plus className="w-8 h-8 text-muted-foreground/70" />
                           </div>
                           <div className="text-center">
                             <div className="font-medium text-muted-foreground">{LIBERATION_MESSAGES.NO_CHARACTERS_SELECTED}</div>
                             <div className="text-sm text-muted-foreground/70">
                               {LIBERATION_MESSAGES.NO_CHARACTERS_DESCRIPTION}
                             </div>
                           </div>
                         </div>
                </CardContent>
              </Card>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Select Character</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                {characters.length > 0 ? (
                  characters.map((character) => (
            <Card
                      key={character.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => handleCharacterSelect(character)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted/20 flex items-center justify-center">
                            {character.avatarUrl ? (
                              <img 
                                src={character.avatarUrl} 
                                alt={character.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Users className={`w-6 h-6 text-muted-foreground ${character.avatarUrl ? 'hidden' : ''}`} />
                </div>
                          <div className="flex-1">
                            <div className="font-medium">{character.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {character.class} • Lv. {character.level}
                  </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {character.id === activeCharacterId && calculation && inputs.targetTraces > 0 && calculation.finalTraces !== undefined
                                ? Math.round((calculation.finalTraces / inputs.targetTraces) * 100)
                                : character.completionRate}% Complete
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                  ))
                ) : (
                         <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                           <Users className="w-16 h-16 text-muted-foreground/50" />
                           <div>
                             <h3 className="text-lg font-semibold">{LIBERATION_MESSAGES.NO_CHARACTERS_FOUND}</h3>
                             <p className="text-muted-foreground">
                               {LIBERATION_MESSAGES.NO_CHARACTERS_FOUND_DESCRIPTION}
                             </p>
                           </div>
                         </div>
          )}
      </div>
            </SheetContent>
          </Sheet>
          )}
    </div>
    </>
  );
};
