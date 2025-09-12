import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Plus, Users } from 'lucide-react';
import { useRoster } from '@/features/roster/hooks/useRoster';
import { Character as RosterCharacter } from '@/features/roster/types/roster';
import { FragmentCharacter, HEXASkill } from '../types';
import { FRAGMENT_MESSAGES } from '../constants';
import { mapRosterToFragmentCharacters } from '../utils';
import { createFragmentCharacter, calculateProgression, calculateCompletionEstimate } from '../utils/hexaCalculations';
import { FragmentStorageService } from '../services/storageService';
import { FragmentCalculatorHeader } from './FragmentCalculatorHeader';
import { CharacterDetailScreen } from './CharacterDetailScreen';

export const FragmentCalculator = () => {
  const { characters: rosterCharacters } = useRoster();
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [skillUpdateTrigger, setSkillUpdateTrigger] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load saved character IDs from localStorage on mount
  useEffect(() => {
    const savedCharacterIds = FragmentStorageService.loadSelectedCharacterIds();
    if (savedCharacterIds.length > 0) {
      setSelectedCharacterIds(savedCharacterIds);
      setActiveCharacterId(savedCharacterIds[0]);
    }
  }, []);

  // Save character IDs to localStorage whenever selectedCharacterIds changes
  useEffect(() => {
    FragmentStorageService.saveSelectedCharacterIds(selectedCharacterIds);
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

  // Map only selected roster characters to fragment characters with HEXA data
  const characters: FragmentCharacter[] = useMemo(() => {
    const selectedRosterCharacters = rosterCharacters.filter(char => selectedCharacterIds.includes(char.id));
    return selectedRosterCharacters.map(rosterChar => {
      // Always create character with default skills first
      const fragmentChar = createFragmentCharacter(rosterChar);
      
      // Then load saved user data from localStorage if it exists and merge with fresh skill metadata
      const savedUserData = FragmentStorageService.loadCharacterSkills(rosterChar.id);
      if (savedUserData) {
        // Merge saved user data with fresh skill metadata
        fragmentChar.hexaSkills = fragmentChar.hexaSkills.map(skill => {
          const savedData = savedUserData.find(saved => saved.id === skill.id);
          if (savedData) {
            return {
              ...skill, // Keep fresh metadata (name, icon, skillType, maxLevel)
              currentLevel: savedData.currentLevel,
              targetLevel: savedData.targetLevel,
              isComplete: savedData.isComplete
            };
          }
          return skill; // Keep default values if no saved data
        });
        
        // Recalculate progression with updated skills
        fragmentChar.progression = calculateProgression(fragmentChar.hexaSkills);
        fragmentChar.estimatedCompletionDays = calculateCompletionEstimate(fragmentChar.hexaSkills, fragmentChar.dailyRate);
        fragmentChar.fragmentProgress = fragmentChar.progression.completionPercentage;
      }
      
      return fragmentChar;
    });
  }, [rosterCharacters, selectedCharacterIds, skillUpdateTrigger]);

  // Get selected characters (same as characters now)
  const selectedCharacters: FragmentCharacter[] = characters;

  // Get active character
  const activeCharacter: FragmentCharacter | null = 
    activeCharacterId ? characters.find(char => char.id === activeCharacterId) || null : null;

  const handleCharacterSelect = (character: RosterCharacter) => {
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

  const handleCharacterClick = (character: FragmentCharacter) => {
    setActiveCharacterId(character.id);
  };

  const handleSkillUpdate = (characterId: string, skillId: string, updates: Partial<HEXASkill>) => {
    // Get current character to find the skill
    const character = characters.find(char => char.id === characterId);
    if (!character) return;
    
    // Update the skill in the character's skills array
    const updatedSkills = character.hexaSkills.map(skill => 
      skill.id === skillId ? { ...skill, ...updates } : skill
    );
    
    // Save updated skills to localStorage
    FragmentStorageService.saveCharacterSkills(characterId, updatedSkills);
    
    // Trigger a re-render to update the UI
    setSkillUpdateTrigger(prev => prev + 1);
  };

  const handleAddSkill = () => {
    // In a real app, this would open a skill selection modal
    console.log('Add skill');
  };


  return (
    <>
      <FragmentCalculatorHeader />

      {/* Character Fragment Manager */}
      <div className="mt-6 space-y-6">
        {/* Selected Characters Display */}
        {selectedCharacters.length > 0 && (
          <ScrollArea ref={scrollAreaRef} className="w-full rounded-md border whitespace-nowrap">
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
                          {(character.fragmentProgress || 0).toFixed(1)}% Fragment Progress
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
                          <div className="text-sm font-medium text-muted-foreground">{FRAGMENT_MESSAGES.ADD_CHARACTER}</div>
                          <div className="text-xs text-muted-foreground/70">
                            {FRAGMENT_MESSAGES.ADD_CHARACTER_DESCRIPTION}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                  <SheetTitle>Select Character</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {rosterCharacters.length > 0 ? (
                    rosterCharacters.map((character) => {
                      const isSelected = selectedCharacterIds.includes(character.id);
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
                        <h3 className="text-lg font-semibold">{FRAGMENT_MESSAGES.NO_CHARACTERS_FOUND}</h3>
                        <p className="text-muted-foreground">
                          {FRAGMENT_MESSAGES.NO_CHARACTERS_FOUND_DESCRIPTION}
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

        {/* No Characters Selected State */}
        {selectedCharacters.length === 0 && (
          <Sheet open={isCharacterSheetOpen} onOpenChange={setIsCharacterSheetOpen}>
            <SheetTrigger asChild>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                      <Plus className="w-8 h-8 text-muted-foreground/70" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-muted-foreground">{FRAGMENT_MESSAGES.NO_CHARACTERS_SELECTED}</div>
                      <div className="text-sm text-muted-foreground/70">
                        {FRAGMENT_MESSAGES.NO_CHARACTERS_DESCRIPTION}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
              <SheetHeader>
                <SheetTitle>Select Character</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {rosterCharacters.length > 0 ? (
                  rosterCharacters.map((character) => {
                    const isSelected = selectedCharacterIds.includes(character.id);
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
                      <h3 className="text-lg font-semibold">{FRAGMENT_MESSAGES.NO_CHARACTERS_FOUND}</h3>
                      <p className="text-muted-foreground">
                        {FRAGMENT_MESSAGES.NO_CHARACTERS_FOUND_DESCRIPTION}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Character Detail Screen */}
        {activeCharacter && (
          <CharacterDetailScreen
            character={activeCharacter}
            onSkillUpdate={handleSkillUpdate}
            onAddSkill={handleAddSkill}
            isLoading={false}
          />
        )}
      </div>
    </>
  );
};
