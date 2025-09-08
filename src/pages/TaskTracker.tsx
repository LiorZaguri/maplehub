
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Layout from '@/components/Layout';

import {
  TaskStats,
  TaskFilters,
  CharacterTaskGrid,
  TaskSelectorDialog,
  useTaskTracker
} from '@/features/task-tracker';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { taskTemplates } from '@/data/taskTemplates';

import { RotateCcw, Star } from 'lucide-react';

const TaskTracker = () => {
  const {
    characters,
    tasks,
    stats,
    filteredCharacters,
    taskFilter,
    hiddenCharacters,
    expandedTaskLists,
    enabledTasksByCharacter,
    taskPresets,
    showTaskSelector,
    selectedCharacterForTasks,
    showHideConfirmation,
    characterToHide,
    selectedTaskFrequency,
    showReorderDialog,
    reorderCharacters,
    isLoadingOrder,
    setTaskFilter,
    setShowTaskSelector,
    setSelectedCharacterForTasks,
    setSelectedTaskFrequency,
    setShowReorderDialog,
    setReorderCharacters,
    toggleTaskComplete,
    resetTasks,
    applyTaskPresetsToCharacter,
    toggleSectionCollapse,
    isSectionCollapsed,
    handleReorderCharacters,
    saveCharacterOrderToStorage,
    setHiddenCharacters,
    setExpandedTaskLists,
    setEnabledTasksByCharacter,
    setTaskPresets,
  } = useTaskTracker();



  return (
    <Layout>
      <div className="space-y-6  pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Task Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage daily, weekly, and monthly tasks for all characters
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => {
            // Load current character order for reordering (preserve current order)
            setReorderCharacters([...characters]);
            setShowReorderDialog(true);
          }}
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-primary w-full sm:w-auto"
        >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Reorder
            </Button>
            <Button
              onClick={() => resetTasks('daily')}
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-primary w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Daily
            </Button>
            <Button
              onClick={() => resetTasks('weekly')}
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-primary w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Weekly
            </Button>
          </div>
        </div>
      </div>

      <TaskStats
        stats={stats}
        characters={characters.filter(char => !hiddenCharacters.has(char.name))}
      />

      {/* Compact Character Task Grid */}
      <div>
        <TaskFilters
          taskFilter={taskFilter}
          onFilterChange={(filter) => setTaskFilter(filter)}
          onResetDaily={() => resetTasks('daily')}
          onResetWeekly={() => resetTasks('weekly')}
          onReorderCharacters={() => {
            setReorderCharacters([...characters]);
            setShowReorderDialog(true);
          }}
        />

        <div className="pt-4">
          <CharacterTaskGrid
          characters={filteredCharacters}
          tasks={tasks}
          hiddenCharacters={hiddenCharacters}
          expandedTaskLists={expandedTaskLists}
          onToggleTask={toggleTaskComplete}
          onToggleCharacterVisibility={(characterName) => {
            const isHidden = hiddenCharacters.has(characterName);
            if (isHidden) {
              setHiddenCharacters(prev => {
                const newSet = new Set(prev);
                newSet.delete(characterName);
                return newSet;
              });
            } else {
              // For now, just hide directly without confirmation
              setHiddenCharacters(prev => new Set([...prev, characterName]));
            }
          }}
          onToggleTaskListExpansion={(characterName) => {
            setExpandedTaskLists(prev => {
              const newSet = new Set(prev);
              if (newSet.has(characterName)) {
                newSet.delete(characterName);
              } else {
                newSet.add(characterName);
              }
              return newSet;
            });
          }}
          onOpenTaskSelector={(characterName) => {
            setSelectedCharacterForTasks(characterName);
            // Sync presets with existing tasks when opening dialog
            const characterTasks = tasks.filter(t => t.character === characterName);
            const taskNames = characterTasks.map(t => t.name);
            const currentPresets = enabledTasksByCharacter[characterName] || {};

            // Update presets to match existing tasks
            const updatedPresets = { ...currentPresets };
            taskTemplates.forEach(template => {
              if (taskNames.includes(template.name)) {
                updatedPresets[template.name] = true;
              } else if (!updatedPresets[template.name]) {
                updatedPresets[template.name] = false;
              }
            });

            setEnabledTasksByCharacter(prev => ({
              ...prev,
              [characterName]: updatedPresets
            }));

            setShowTaskSelector(true);
          }}
          onToggleAllTasks={(characterName, checkAll) => {
            // This function is not used in the current implementation
            // but is required by the component interface
          }}
          onToggleSectionCollapse={toggleSectionCollapse}
          isSectionCollapsed={isSectionCollapsed}
        />
        </div>
      </div>

      <TaskSelectorDialog
        open={showTaskSelector}
        onOpenChange={setShowTaskSelector}
        selectedCharacter={selectedCharacterForTasks}
        selectedFrequency={selectedTaskFrequency}
        onFrequencyChange={setSelectedTaskFrequency}
        enabledTasks={enabledTasksByCharacter[selectedCharacterForTasks] || {}}
        onToggleTask={(taskName) => {
          setEnabledTasksByCharacter(prev => {
            const characterEnabled = prev[selectedCharacterForTasks] || {};
            const isCurrentlyEnabled = characterEnabled[taskName] || false;

            return {
              ...prev,
              [selectedCharacterForTasks]: {
                ...characterEnabled,
                [taskName]: !isCurrentlyEnabled
              }
            };
          });
        }}
        taskPresets={taskPresets}
        onSavePreset={(presetName) => {
          const currentEnabled = enabledTasksByCharacter[selectedCharacterForTasks] || {};
          setTaskPresets(prev => ({
            ...prev,
            [presetName]: { ...currentEnabled }
          }));
        }}
        onLoadPreset={(presetName) => {
          const presetTasks = taskPresets[presetName];
          if (presetTasks) {
            setEnabledTasksByCharacter(prev => ({
              ...prev,
              [selectedCharacterForTasks]: { ...presetTasks }
            }));
          }
        }}
        onDeletePreset={(presetName) => {
          setTaskPresets(prev => {
            const updated = { ...prev };
            delete updated[presetName];
            return updated;
          });
        }}
        onApplyTasks={() => applyTaskPresetsToCharacter(selectedCharacterForTasks)}
        taskTemplates={taskTemplates}
      />



      {/* Hide Character Confirmation Dialog */}
      <ConfirmDialog
        open={showHideConfirmation}
        onOpenChange={() => {}}
        title={`Hide ${characterToHide}?`}
        description="This will hide the character from your task tracker. You can show them again using the 'Hidden' filter."
        confirmText="Hide Character"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          setHiddenCharacters(prev => new Set([...prev, characterToHide]));
        }}
        onCancel={() => {}}
      />

      {/* Reorder Characters Dialog */}
      <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reorder Characters</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Use the up/down buttons to change the order of characters in the Task Tracker
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
              {reorderCharacters.map((character, index) => (
                <div
                  key={character.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <img
                      src={character.avatarUrl || '/placeholder.svg'}
                      alt={character.name}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{character.name}</span>
                        {character.isMain && <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Lv. {character.level} • {character.class}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground w-8 text-center">#{index + 1}</span>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          if (index > 0) {
                            const newOrder = [...reorderCharacters];
                            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                            setReorderCharacters(newOrder);
                          }
                        }}
                        disabled={index === 0}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          if (index < reorderCharacters.length - 1) {
                            const newOrder = [...reorderCharacters];
                            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                            setReorderCharacters(newOrder);
                          }
                        }}
                        disabled={index === reorderCharacters.length - 1}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReorderDialog(false);
                  setReorderCharacters([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  saveCharacterOrderToStorage();
                  setShowReorderDialog(false);
                  setReorderCharacters([]);
                }}
                className="btn-hero"
              >
                Save Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TaskTracker;
