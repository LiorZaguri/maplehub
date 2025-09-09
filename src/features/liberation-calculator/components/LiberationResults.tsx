import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LIBERATION_LABELS } from '../constants';
import { LiberationCalculation } from '../types';
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Zap, 
  Crown,
  Info
} from 'lucide-react';

interface LiberationResultsProps {
  calculation: LiberationCalculation | null;
  targetTraces: number;
}

export const LiberationResults = ({ calculation, targetTraces }: LiberationResultsProps) => {
  const hasData = calculation !== null;
  const isCompleted = hasData && calculation.finalTraces >= targetTraces;
  
  if (!hasData) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Data Available</h3>
          <p className="text-sm text-muted-foreground">
            Configure your boss selections and traces to see liberation progress
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Liberation Progress</h3>
            </div>
            {isCompleted && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <Crown className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ETA Display */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {isCompleted ? 'Complete!' : (calculation?.eta ? new Date(calculation.eta).toLocaleDateString() : 'Calculating...')}
            </div>
            <div className="text-sm text-muted-foreground">
              {isCompleted ? 'Liberation achieved' : 'Target liberation date'}
            </div>
          </div>

          {/* Progress Bar */}
          {!isCompleted && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Current Progress</span>
                <span>{calculation?.finalTraces || 0} / {targetTraces.toLocaleString()} traces</span>
              </div>
              <div className="relative">
              <Progress 
                value={Math.min(100, ((calculation?.finalTraces || 0) / targetTraces) * 100)} 
                className="h-3"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white drop-shadow-sm">
                  {Math.round(Math.min(100, ((calculation?.finalTraces || 0) / targetTraces) * 100))}%
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{targetTraces.toLocaleString()}</span>
            </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trace Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">Trace Sources</h4>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
              <span className="text-sm">Weekly traces</span>
            </div>
            <Badge variant="outline" className="font-mono">
              {calculation?.weeklyTraces || 0}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></div>
              <span className="text-sm">Black Mage (monthly)</span>
            </div>
            <Badge variant="outline" className="font-mono">
              {calculation?.bmMonthly || 0}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">4-week total</span>
            </div>
            <Badge variant="default" className="font-mono">
              {calculation ? calculation.weeklyTraces * 4 + calculation.bmMonthly : 0}
            </Badge>
          </div>
          
          {/* Detailed Stats */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Detailed Statistics</div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Total acquisition traces</span>
              <span className="font-mono">
                {calculation?.weeklyTraces || 0} /week + {calculation?.bmMonthly || 0} /month
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Acquisition/demand Traces</span>
              <span className="font-mono">
                {calculation ? calculation.finalTraces : 0} / {targetTraces}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Expected liberation period</span>
              <span className="font-mono">
                {calculation ? `${Math.ceil(calculation.weeksNeeded * 10) / 10} weeks (${Math.floor((calculation.weeksNeeded / 4) * 10) / 10} months)` : '0 weeks (0 months)'}
              </span>
            </div>
          </div>
          
          {/* Visual representation of trace accumulation */}
          {calculation && calculation.weeklyTraces > 0 && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-2">Weekly accumulation:</div>
              <div className="flex space-x-1">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex-1">
                    <div className="text-xs text-center mb-1">Week {i + 1}</div>
                    <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full relative">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: '100%' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {calculation.weeklyTraces}
                        </span>
                      </div>
                    </div>
                    {i === 3 && calculation.bmMonthly > 0 && (
                      <div className="mt-1 h-2 bg-purple-200 dark:bg-purple-800 rounded-full relative">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-300"
                          style={{ width: '100%' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            +{calculation.bmMonthly}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1 text-foreground">Carryover Information</p>
              <p>
                The game lets you hold up to 1,500 traces across steps. 
                Overshooting here simply accelerates the next step.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
