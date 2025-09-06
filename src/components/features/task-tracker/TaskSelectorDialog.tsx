import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Star, Plus, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskTemplate {
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

interface TaskSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCharacter: string;
  selectedFrequency: 'daily' | 'weekly' | 'monthly';
  onFrequencyChange: (frequency: 'daily' | 'weekly' | 'monthly') => void;
  enabledTasks: Record<string, boolean>;
  onToggleTask: (taskName: string) => void;
  taskPresets: Record<string, Record<string, boolean>>;
  onSavePreset: (presetName: string) => void;
  onLoadPreset: (presetName: string) => void;
  onDeletePreset: (presetName: string) => void;
  onApplyTasks: () => void;
  taskTemplates: TaskTemplate[];
}

const TaskSelectorDialog: React.FC<TaskSelectorDialogProps> = ({
  open,
  onOpenChange,
  selectedCharacter,
  selectedFrequency,
  onFrequencyChange,
  enabledTasks,
  onToggleTask,
  taskPresets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onApplyTasks,
  taskTemplates,
}) => {
  const { toast } = useToast();

  const handleSavePreset = () => {
    const presetName = prompt('Enter preset name:');
    if (presetName && presetName.trim()) {
      onSavePreset(presetName.trim());
    }
  };

  const handleDeletePreset = (presetName: string) => {
    if (confirm(`Delete preset "${presetName}"?`)) {
      onDeletePreset(presetName);
    }
  };

  const filteredTemplates = taskTemplates.filter(template => template.frequency === selectedFrequency);
  const categories = [...new Set(filteredTemplates.map(template => template.category))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Choose Tasks for {selectedCharacter}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Task Categories Sidebar */}
          <div className="lg:w-48 lg:flex-shrink-0">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2">
              {/* Frequency Navigation */}
              <nav className="space-y-2 py-2">
                <Button
                  onClick={() => onFrequencyChange('daily')}
                  variant={selectedFrequency === 'daily' ? 'default' : 'ghost'}
                  className={`w-full justify-start space-x-2 ${
                    selectedFrequency === 'daily' ? 'btn-hero' : 'hover:bg-card hover:text-primary'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Daily Tasks</span>
                </Button>
                <Button
                  onClick={() => onFrequencyChange('weekly')}
                  variant={selectedFrequency === 'weekly' ? 'default' : 'ghost'}
                  className={`w-full justify-start space-x-2 ${
                    selectedFrequency === 'weekly' ? 'btn-hero' : 'hover:bg-card hover:text-primary'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Weekly Tasks</span>
                </Button>
                <Button
                  onClick={() => onFrequencyChange('monthly')}
                  variant={selectedFrequency === 'monthly' ? 'default' : 'ghost'}
                  className={`w-full justify-start space-x-2 ${
                    selectedFrequency === 'monthly' ? 'btn-hero' : 'hover:bg-card hover:text-primary'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  <span>Monthly Tasks</span>
                </Button>
              </nav>

              {/* Preset Templates */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Your Presets
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleSavePreset}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
                  {Object.keys(taskPresets).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No presets yet
                    </p>
                  ) : (
                    Object.entries(taskPresets).map(([presetName, presetTasks]) => {
                      const taskCount = Object.values(presetTasks).filter(Boolean).length;
                      return (
                        <div key={presetName} className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 justify-start text-xs h-6 px-2 truncate"
                            onClick={() => onLoadPreset(presetName)}
                          >
                            <span className="truncate">{presetName}</span>
                            <span className="text-xs opacity-60 ml-1">({taskCount})</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive flex-shrink-0"
                            onClick={() => handleDeletePreset(presetName)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Task Grid */}
          <div className="flex-1 min-w-0">
            <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
              <div className="space-y-6">
                {categories.map(category => {
                  const categoryTasks = filteredTemplates.filter(template => template.category === category);

                  return (
                    <div key={category} className="space-y-3">
                      <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryTasks.map((template, index) => {
                          const isSelected = enabledTasks[template.name] || false;

                          return (
                            <div
                              key={index}
                              className={`relative rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                                isSelected
                                  ? 'border-primary bg-primary/5 shadow-md'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => onToggleTask(template.name)}
                            >
                              {/* Selection overlay */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 z-10">
                                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              )}

                              <div className="p-3">
                                <h3 className="font-semibold text-sm text-primary mb-1">
                                  {template.name}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => {
              onApplyTasks();
              onOpenChange(false);
            }}
            className="btn-hero"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskSelectorDialog;
