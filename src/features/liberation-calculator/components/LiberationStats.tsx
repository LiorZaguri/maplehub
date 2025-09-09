import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, TrendingUp, Calendar, Clock, Star } from 'lucide-react';
import { LiberationProgress, LiberationSchedule, LiberationType } from '../types/liberation';

interface LiberationStatsProps {
  progress: LiberationProgress;
  schedule: LiberationSchedule;
  liberationType: LiberationType;
}

const LiberationStats: React.FC<LiberationStatsProps> = ({
  progress,
  schedule,
  liberationType
}) => {
  const progressPercentage = progress.totalTracesNeeded > 0
    ? (progress.traceOfDarkness / progress.totalTracesNeeded) * 100
    : 0;

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 pb-6">
      {/* Current Traces */}
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">
                {formatNumber(progress.traceOfDarkness)}
              </p>
              <p className="text-sm text-muted-foreground">Current Traces</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Traces Needed */}
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {formatNumber(progress.totalTracesNeeded)}
              </p>
              <p className="text-sm text-muted-foreground">Total Needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Percentage */}
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {progressPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Progress</p>
              <Progress value={progressPercentage} className="mt-2 h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Traces */}
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">
                {formatNumber(schedule.weeklyTraces)}
              </p>
              <p className="text-sm text-muted-foreground">Weekly Traces</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weeks Remaining */}
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">
                {schedule.weeksToComplete === Infinity ? '∞' : schedule.weeksToComplete}
              </p>
              <p className="text-sm text-muted-foreground">Weeks Left</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liberation Type */}
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-lg font-bold capitalize">
                {liberationType}
              </p>
              <p className="text-sm text-muted-foreground">Liberation Type</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiberationStats;
