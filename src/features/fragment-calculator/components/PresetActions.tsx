import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RotateCcw, Maximize, Settings, Loader2 } from 'lucide-react';

interface PresetActionsProps {
  onMaxAll: () => void;
  onReset: () => void;
  onPresetSelect: (preset: string) => void;
  isLoading?: boolean;
  className?: string;
}

const presets = [
  { id: 'balanced', name: 'Balanced Build', description: 'Even distribution across all skills' },
  { id: 'damage', name: 'Damage Focus', description: 'Prioritize damage skills' },
  { id: 'utility', name: 'Utility Focus', description: 'Prioritize utility and support skills' },
  { id: 'hybrid', name: 'Hybrid Build', description: 'Mix of damage and utility' },
];

export const PresetActions = ({
  onMaxAll,
  onReset,
  onPresetSelect,
  isLoading = false,
  className
}: PresetActionsProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        size="sm"
        variant="outline"
        onClick={onMaxAll}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Max All</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onReset}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">Reset</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Presets</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => onPresetSelect(preset.id)}
              className="flex flex-col items-start gap-1 p-3"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs text-muted-foreground">{preset.description}</div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
