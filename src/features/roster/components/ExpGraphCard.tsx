import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { Character } from '../types/roster';
import ExpChart from './ExpChart';

const PERIODS = ['7D', '14D', '30D'] as const;
type ExpTimePeriod = typeof PERIODS[number];

interface ExpGraphCardProps {
  selectedExpCharacter: Character | null;
  mainCharacter?: Character;
  expChartTimePeriod: ExpTimePeriod;
  onTimePeriodChange: (period: ExpTimePeriod) => void;
  isDataRefreshing?: boolean;
}

const ExpGraphCard: React.FC<ExpGraphCardProps> = ({
  selectedExpCharacter,
  mainCharacter,
  expChartTimePeriod,
  onTimePeriodChange,
  isDataRefreshing = false,
}) => {
  // Prefer explicit null fallback so downstream checks are simple
  const displayCharacter: Character | null = selectedExpCharacter ?? mainCharacter ?? null;
  const expGraphData = displayCharacter?.additionalData?.expGraphData;
  const hasData = Boolean(expGraphData?.data && expGraphData.data.length > 0);

  return (
    <Card className="card-gaming" aria-busy={isDataRefreshing}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Exp Graph</span>
          </CardTitle>

          {/* Time Period Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Last:</span>
            <div className="flex gap-2" role="group" aria-label="Select time period">
              {PERIODS.map((period) => {
                const selected = expChartTimePeriod === period;
                return (
                  <Button
                    key={period}
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTimePeriodChange(period)}
                    className="text-xs"
                    aria-pressed={selected}
                    disabled={isDataRefreshing}
                  >
                    {period}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isDataRefreshing ? (
          <div className="flex items-center justify-center h-56" role="status" aria-live="polite">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Refreshing character data…</p>
            </div>
          </div>
        ) : hasData ? (
          <div className="w-full h-56">
            <ExpChart
              data={expGraphData!.data}
              labels={expGraphData!.labels || []}
              timePeriod={expChartTimePeriod}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-10 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p className="text-sm">No experience data available</p>
            <p className="text-xs mt-1 h-20">
              {selectedExpCharacter
                ? `Experience graph will appear here when data is available for ${selectedExpCharacter.name}.`
                : 'Experience graph will appear here when data is available.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpGraphCard;
