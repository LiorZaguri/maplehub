import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface BossTrackerHeaderProps {
  onReorderClick: () => void;
  onResetAll: () => void;
}

export const BossTrackerHeader = ({ onReorderClick, onResetAll }: BossTrackerHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Boss Tracker
        </h1>
        <p className="text-muted-foreground mt-1">
          Track weekly and daily boss completions across all characters
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={onReorderClick}
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
          onClick={onResetAll}
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-primary w-full sm:w-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All
        </Button>
      </div>
    </div>
  );
};
