import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Calendar, BarChart3, RotateCcw, Pencil, MoreHorizontal, XIcon } from 'lucide-react';
import BossCard from './BossCard';
import { GroupedBosses, BossCategory } from '../utils/bossGroupingUtils';
import { Character } from '../types/roster';

import { DEFAULT_PRESET_NAMES } from '../data/bossPresets';

export interface BossEditorMobileLayoutProps {
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
  makeGroupKey: (category: string, base: string) => string;
  setBaseEnabledByBase: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setSelectedVariantByBase: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setPartySizes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  toast: (options: { title: string; description: string; variant?: "default" | "destructive" }) => void;
  // Preset related props
  presets: string[];
  selectedPreset: string | null;
  showAddPreset: boolean;
  newPresetName: string;
  editingPreset: string | null;
  setSelectedPreset: (id: string | null) => void;
  setShowAddPreset: (show: boolean) => void;
  setNewPresetName: (name: string) => void;
  applyPreset: (presetId: string) => void;
  editPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  saveCustomPreset: (name: string, selectedBosses: string[], partySizes: Record<string, number>) => void;
  updateExistingPreset: (name: string, selectedBosses: string[], partySizes: Record<string, number>) => void;
  getCurrentlySelectedBosses: () => string[];
}

const BossEditorMobileLayout: React.FC<BossEditorMobileLayoutProps> = ({
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
  makeGroupKey,
  setBaseEnabledByBase,
  setSelectedVariantByBase,
  setPartySizes,
  toast,
  presets,
  selectedPreset,
  showAddPreset,
  newPresetName,
  editingPreset,
  setSelectedPreset,
  setShowAddPreset,
  setNewPresetName,
  applyPreset,
  editPreset,
  deletePreset,
  saveCustomPreset,
  updateExistingPreset,
  getCurrentlySelectedBosses,
}) => {
  return (
    <div className="lg:hidden flex flex-col min-h-0 flex-1">
      {/* Mobile Header */}
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 mb-4 flex-shrink-0">
        {/* Compact Navigation and Presets in one row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Tab Selector */}
          <Select value={activeTab} onValueChange={(value: BossCategory) => setActiveTab(value)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly" className="text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monthly
                </div>
              </SelectItem>
              <SelectItem value="weekly" className="text-xs">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Weekly
                </div>
              </SelectItem>
              <SelectItem value="daily" className="text-xs">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Daily
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Preset Selector */}
          <Select value={selectedPreset || ''} onValueChange={(value) => value && applyPreset(value)}>
            <SelectTrigger className="flex-1 h-8 text-xs">
              <SelectValue placeholder="Choose preset..." />
            </SelectTrigger>
            <SelectContent>
              {presets.map(preset => (
                <SelectItem key={preset} value={preset} className="text-xs">
                  <div className="flex items-center justify-between w-full">
                    <span>{preset}</span>
                    {!DEFAULT_PRESET_NAMES.includes(preset) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-2"
                            onClick={(e) => e.stopPropagation()}
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
                                  Are you sure you want to delete the "{preset}" preset? This action cannot be undone.
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
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save Changes or Add New Preset */}
        {editingPreset ? (
          <Button
            onClick={() => updateExistingPreset(editingPreset, getCurrentlySelectedBosses(), partySizes)}
            variant="default"
            size="sm"
            className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700"
          >
            Save Changes to "{editingPreset}"
          </Button>
        ) : !showAddPreset ? (
          <Button
            onClick={() => setShowAddPreset(true)}
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
          >
            Save Current as Preset
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name..."
              className="flex-1 h-7 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPresetName.trim()) {
                  saveCustomPreset(newPresetName.trim(), getCurrentlySelectedBosses(), partySizes);
                  setNewPresetName('');
                  setShowAddPreset(false);
                }
              }}
            />
            <Button
              onClick={() => {
                if (newPresetName.trim()) {
                  saveCustomPreset(newPresetName.trim(), getCurrentlySelectedBosses(), partySizes);
                  setNewPresetName('');
                  setShowAddPreset(false);
                }
              }}
              variant="outline"
              size="sm"
              className="h-7 px-2"
            >
              ✓
            </Button>
            <Button
              onClick={() => {
                setNewPresetName('');
                setShowAddPreset(false);
              }}
              variant="outline"
              size="sm"
              className="h-7 px-2"
            >
              ✕
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Main Content - Flexible height */}
      <div className="flex-1 min-h-0">
        {/* Search Bar */}
        <div className="mb-4 flex-shrink-0">
          <Input
            placeholder={`Search ${activeTab} bosses...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <ScrollArea className="flex-1 rounded border p-4 h-[50vh]" style={{ border: '0' }}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            {([['monthly', filteredGroupedMonthly], ['weekly', filteredGroupedWeekly], ['daily', filteredGroupedDaily]] as const).map(([key, data]) => (
              <TabsContent key={key} value={key} className="m-0">
                {data.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No {key} bosses found matching your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

export default BossEditorMobileLayout;
