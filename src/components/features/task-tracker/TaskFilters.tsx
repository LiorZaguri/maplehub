import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filter, RotateCcw } from 'lucide-react';
import { CharacterFilterType } from '@/lib/filterUtils';

interface TaskFiltersProps {
  taskFilter: CharacterFilterType;
  onFilterChange: (filter: CharacterFilterType) => void;
  onResetDaily: () => void;
  onResetWeekly: () => void;
  onReorderCharacters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  taskFilter,
  onFilterChange,
  onResetDaily,
  onResetWeekly,
  onReorderCharacters
}) => {
  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter characters:</span>
          <ToggleGroup
            type="single"
            value={taskFilter}
            onValueChange={(value) => onFilterChange(value as CharacterFilterType || 'all')}
          >
            <ToggleGroupItem value="all" size="sm">All</ToggleGroupItem>
            <ToggleGroupItem value="finished" size="sm">Finished</ToggleGroupItem>
            <ToggleGroupItem value="unfinished" size="sm">Unfinished</ToggleGroupItem>
            <ToggleGroupItem value="hidden" size="sm">Hidden</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>


    </div>
  );
};

export default TaskFilters;
