import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, BarChart3, RotateCcw, Pencil, XIcon, MoreHorizontal } from 'lucide-react';
import BossCard from './BossCard';
import { GroupedBosses, BossCategory } from '../utils/bossGroupingUtils';
import { Character } from '../types/roster';

import { DEFAULT_PRESET_NAMES } from '../data/bossPresets';

export interface BossEditorDesktopLayoutProps {
  activeTab: BossCategory;
  setActiveTab: (tab: BossCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredGroupedDaily: GroupedBosses;
  filteredGroupedWeekly: GroupedBosses;
  filteredGroupedMonthly: GroupedBosses;
  baseEnabledByBase: Record<string, boolean>;
  selectedVariantByBase: Record<string, string>;
  partySizes: Record<string, number>;
  characters: Character[];
  characterName: string | null;
  worldMultiplier: number;
  makeGroupKey: (category: string, base: string) => string;
  setBaseEnabledByBase: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setSelectedVariantByBase: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setPartySizes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  toast: (options: { title: string; description: string; variant?: "default" | "destructive" }) => void;
  // Preset related props
  presets: string[];
  selectedPreset: string | null;
  showAddPreset: boolean;
  showSavePresetDialog: boolean;
  pendingPresetName: string;
  newPresetName: string;
  editingPreset: string | null;
  setSelectedPreset: (id: string | null) => void;
  setShowAddPreset: (show: boolean) => void;
  setShowSavePresetDialog: (show: boolean) => void;
  setPendingPresetName: (name: string) => void;
  setNewPresetName: (name: string) => void;
  applyPreset: (presetId: string) => void;
  editPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  saveCustomPreset: (name: string, selectedBosses: string[], partySizes: Record<string, number>) => void;
  updateExistingPreset: (name: string, selectedBosses: string[], partySizes: Record<string, number>) => void;
  getCurrentlySelectedBosses: () => string[];
}

const BossEditorDesktopLayout: React.FC<BossEditorDesktopLayoutProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  filteredGroupedDaily,
  filteredGroupedWeekly,
  filteredGroupedMonthly,
  baseEnabledByBase,
  selectedVariantByBase,
  partySizes,
  characters,
  characterName,
  worldMultiplier,
  makeGroupKey,
  setBaseEnabledByBase,
  setSelectedVariantByBase,
  setPartySizes,
  toast,
  presets,
  selectedPreset,
  showAddPreset,
  showSavePresetDialog,
  pendingPresetName,
  newPresetName,
  editingPreset,
  setSelectedPreset,
  setShowAddPreset,
  setShowSavePresetDialog,
  setPendingPresetName,
  setNewPresetName,
  applyPreset,
  editPreset,
  deletePreset,
  saveCustomPreset,
  updateExistingPreset,
  getCurrentlySelectedBosses,
}) => {
  return (
    <div className="hidden lg:flex lg:flex-row gap-4">
      {/* Desktop Sidebar */}
      <div className="w-48 flex-shrink-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2">
          <nav className="space-y-2 py-2">
            <Button
              onClick={() => setActiveTab('monthly')}
              variant={activeTab === 'monthly' ? "default" : "ghost"}
              className={`w-full justify-start space-x-2 ${
                activeTab === 'monthly'
                  ? 'btn-hero shadow-[var(--shadow-button)]'
                  : 'hover:bg-card hover:text-primary'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Monthly</span>
            </Button>
            <Button
              onClick={() => setActiveTab('weekly')}
              variant={activeTab === 'weekly' ? "default" : "ghost"}
              className={`w-full justify-start space-x-2 ${
                activeTab === 'weekly'
                  ? 'btn-hero shadow-[var(--shadow-button)]'
                  : 'hover:bg-card hover:text-primary'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Weekly</span>
            </Button>
            <Button
              onClick={() => setActiveTab('daily')}
              variant={activeTab === 'daily' ? "default" : "ghost"}
              className={`w-full justify-start space-x-2 ${
                activeTab === 'daily'
                  ? 'btn-hero shadow-[var(--shadow-button)]'
                  : 'hover:bg-card hover:text-primary'
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Daily</span>
            </Button>
          </nav>

          {/* Presets Section */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Presets
            </div>
            <div className="space-y-2">
              {presets.map(preset => (
                <div key={preset} className="flex items-center gap-1">
                  <Button
                    onClick={() => applyPreset(preset)}
                    variant={selectedPreset === preset ? "default" : "ghost"}
                    className="flex-1 justify-start text-xs h-8 px-2 truncate"
                  >
                    {preset}
                  </Button>
                  {!DEFAULT_PRESET_NAMES.includes(preset) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => editPreset(preset)}>
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <XIcon className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Preset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{preset}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePreset(preset)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
            
            {/* Save Changes or Add New Preset Button */}
            {editingPreset ? (
              <Button
                onClick={() => updateExistingPreset(editingPreset, getCurrentlySelectedBosses(), partySizes)}
                variant="default"
                className="w-full mt-3 h-8 text-xs bg-blue-600 hover:bg-blue-700"
              >
                Save Changes to "{editingPreset}"
              </Button>
            ) : (
              <AlertDialog open={showSavePresetDialog} onOpenChange={setShowSavePresetDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={() => setShowSavePresetDialog(true)}
                    variant="outline"
                    className="w-full mt-3 h-8 text-xs"
                  >
                    Save Current as Preset
                  </Button>
                </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Save Preset</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter a name for your custom boss preset.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input
                    value={pendingPresetName}
                    onChange={(e) => setPendingPresetName(e.target.value)}
                    placeholder="Preset name..."
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && pendingPresetName.trim()) {
                        saveCustomPreset(pendingPresetName.trim(), getCurrentlySelectedBosses(), partySizes);
                        setPendingPresetName('');
                        setShowSavePresetDialog(false);
                      }
                    }}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {
                    setPendingPresetName('');
                    setShowSavePresetDialog(false);
                  }}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (pendingPresetName.trim()) {
                        saveCustomPreset(pendingPresetName.trim(), getCurrentlySelectedBosses(), partySizes);
                        setPendingPresetName('');
                        setShowSavePresetDialog(false);
                      }
                    }}
                  >
                    Save
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            )}
          </div>

          {/* Weekly Earnings Display */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Weekly Earnings
            </div>
            <div className="text-sm font-semibold text-primary">
              {(() => {
                let totalWeeklyMesos = 0;

                // Calculate weekly bosses earnings
                filteredGroupedWeekly.forEach(([base, variants]) => {
                  const gkey = makeGroupKey('weekly', base);
                  const enabled = !!baseEnabledByBase[gkey];
                  if (enabled) {
                    const selectedVariant = selectedVariantByBase[gkey] || variants[0]?.name;
                    const variant = variants.find(v => v.name === selectedVariant);
                    if (variant) {
                      const partySize = partySizes[variant.name] || 1;
                      totalWeeklyMesos += Math.floor((variant.mesos / Math.max(1, partySize)) * worldMultiplier);
                    }
                  }
                });
                // Calculate daily bosses earnings (daily bosses can be done multiple times per week)
                filteredGroupedDaily.forEach(([base, variants]) => {
                  const gkey = makeGroupKey('daily', base);
                  const enabled = !!baseEnabledByBase[gkey];
                  if (enabled) {
                    const selectedVariant = selectedVariantByBase[gkey] || variants[0]?.name;
                    const variant = variants.find(v => v.name === selectedVariant);
                    if (variant) {
                      const partySize = partySizes[variant.name] || 1;
                      totalWeeklyMesos += Math.floor((variant.mesos / Math.max(1, partySize)) * worldMultiplier * 7); // 7 times per week
                    }
                  }
                });

                return totalWeeklyMesos.toLocaleString();
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Boss Grid */}
      <div className="flex-1 min-w-0">
        {/* Search Bar */}
        <div className="mb-4">
          <Input
            placeholder={`Search ${activeTab} bosses...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm"
          />
        </div>
        <ScrollArea className="h-[50vh] sm:h-[60vh] lg:h-[65vh] rounded border p-4" style={{ border: '0' }}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            {([['monthly', filteredGroupedMonthly], ['weekly', filteredGroupedWeekly], ['daily', filteredGroupedDaily]] as const).map(([key, data]) => (
              <TabsContent key={key} value={key} className="m-0">
                {data.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No {key} bosses found matching your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map(([base, variants]) => {
                      const isSelected = !!baseEnabledByBase[makeGroupKey(key, base)];
                      const selectedVariant = selectedVariantByBase[makeGroupKey(key, base)] || variants[0]?.name;
                      const currentVariant = variants.find(v => v.name === selectedVariant) || variants[0];
                      const partySize = partySizes[currentVariant?.name || ''] || 1;

                      const handleToggle = () => {
                        const currentWeeklyCount = Object.values(baseEnabledByBase).filter((enabled, index) => {
                          const keys = Object.keys(baseEnabledByBase);
                          const key = keys[index];
                          return enabled && key.startsWith('weekly:');
                        }).length;

                        const isWeekly = key === 'weekly';
                        const isDaily = key === 'daily';
                        const wouldExceedLimit = (isWeekly || isDaily) && !isSelected && currentWeeklyCount >= 14;

                        if (wouldExceedLimit) {
                          toast({
                            title: "Weekly Boss Limit Reached",
                            description: "You've reached the 14 weekly boss limit. Please remove another boss before adding this one.",
                            variant: "destructive"
                          });
                          return;
                        }

                        setBaseEnabledByBase(prev => ({ ...prev, [makeGroupKey(key, base)]: !prev[makeGroupKey(key, base)] }));
                      };

                      const handleVariantChange = (variant: string) => {
                        setSelectedVariantByBase(prev => ({ ...prev, [makeGroupKey(key, base)]: variant }));
                      };

                      const handlePartySizeChange = (newSize: number) => {
                        setPartySizes(prev => ({ ...prev, [currentVariant?.name || '']: newSize }));
                      };

                      return (
                        <BossCard
                          key={`boss-${key}-${base}`}
                          base={base}
                          variants={variants}
                          isSelected={isSelected}
                          selectedVariant={selectedVariant}
                          partySize={partySize}
                          category={key}
                          characters={characters}
                          characterName={characterName}
                          onToggle={handleToggle}
                          onVariantChange={handleVariantChange}
                          onPartySizeChange={handlePartySizeChange}
                          onToast={toast}
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  );
};

export default BossEditorDesktopLayout;
