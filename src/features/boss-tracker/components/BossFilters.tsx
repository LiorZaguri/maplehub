import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filter } from 'lucide-react';
import { FilterType } from '../types/bossTracker';

interface BossFiltersProps {
  bossFilter: FilterType;
  setBossFilter: (filter: FilterType) => void;
}

export const BossFilters = ({ bossFilter, setBossFilter }: BossFiltersProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Filter characters:</span>
      <ToggleGroup 
        type="single" 
        value={bossFilter} 
        onValueChange={(value) => setBossFilter(value as FilterType || 'all')}
      >
        <ToggleGroupItem value="all" size="sm">All</ToggleGroupItem>
        <ToggleGroupItem value="finished" size="sm">Finished</ToggleGroupItem>
        <ToggleGroupItem value="unfinished" size="sm">Unfinished</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
