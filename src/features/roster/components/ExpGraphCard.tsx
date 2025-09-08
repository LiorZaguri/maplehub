import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { Character } from '../types/roster';
import ExpChart from './ExpChart';

interface ExpGraphCardProps {
  selectedExpCharacter: Character | null;
  mainCharacter: Character | undefined;
  expChartTimePeriod: '7D' | '14D' | '30D';
  onTimePeriodChange: (period: '7D' | '14D' | '30D') => void;
}

const ExpGraphCard: React.FC<ExpGraphCardProps> = ({
  selectedExpCharacter,
  mainCharacter,
  expChartTimePeriod,
  onTimePeriodChange,
}) => {
  const displayCharacter = selectedExpCharacter || mainCharacter;

  return (
    <Card className="card-gaming">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Exp Graph</span>
          </CardTitle>
          {/* Time Period Selector - Moved to top right */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Last:</span>
            <div className="flex gap-2">
              {(['7D', '14D', '30D'] as const).map((period) => (
                <Button
                  key={period}
                  variant={expChartTimePeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimePeriodChange(period)}
                  className="text-xs"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(() => {
          return displayCharacter?.additionalData?.expGraphData?.data && displayCharacter.additionalData.expGraphData.data.length > 0 ? (
            <div className="w-full h-56">
              <ExpChart
                data={displayCharacter.additionalData.expGraphData.data}
                labels={displayCharacter.additionalData.expGraphData.labels || []}
                timePeriod={expChartTimePeriod}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-10 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No experience data available</p>
              <p className="text-xs mt-1 h-20">
                {selectedExpCharacter
                  ? `Experience graph will appear here when data is available for ${selectedExpCharacter.name}`
                  : "Experience graph will appear here when data is available"
                }
              </p>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

export default ExpGraphCard;