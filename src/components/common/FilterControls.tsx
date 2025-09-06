import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterControlsProps {
  options: FilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  title?: string;
  className?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  options,
  value,
  onValueChange,
  title = 'Filter:',
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{title}</span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(newValue) => onValueChange(newValue || options[0]?.value || '')}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} size="sm">
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default FilterControls;
