import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Star, Coins } from 'lucide-react';
import { useTimeCalculations } from '@/hooks/useTimeCalculations';
import { formatMesos } from '@/lib/sharedUtils';
import { Character, TaskStats } from '../types/taskTracker';

interface TaskStatsProps {
  stats: TaskStats;
  characters: Character[];
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats, characters }) => {
  const { getTimeUntilReset, formatTimeRemaining, isUrsusGoldenTime, getUrsusGoldenTimeRemaining, getNextUrsusGoldenTime } = useTimeCalculations();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-6">
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {formatTimeRemaining(getTimeUntilReset.daily, 'daily')}
              </p>
              <p className="text-sm text-muted-foreground">Daily Reset</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-success" />
            <div>
              <p className="text-2xl font-bold">
                {formatTimeRemaining(getTimeUntilReset.weekly, 'weekly')}
              </p>
              <p className="text-sm text-muted-foreground">Weekly Reset</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">
                {formatTimeRemaining(getTimeUntilReset.monthly, 'monthly')}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Reset</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`card-glow ${isUrsusGoldenTime ? 'ring-2 ring-yellow-400 shadow-yellow-400/20' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              isUrsusGoldenTime
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : 'bg-muted text-muted-foreground'
            }`}>
              {isUrsusGoldenTime ? <Coins className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div>
              <p className={`text-2xl font-bold ${isUrsusGoldenTime ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                {isUrsusGoldenTime
                  ? (getUrsusGoldenTimeRemaining ? formatTimeRemaining(getUrsusGoldenTimeRemaining, 'daily') : 'ACTIVE')
                  : (() => {
                      const nextTime = getNextUrsusGoldenTime;
                      if (nextTime) {
                        const timeDiff = Math.max(0, Math.floor((nextTime.getTime() - new Date().getTime()) / 1000));
                        return formatTimeRemaining(timeDiff, 'daily');
                      }
                      return 'Waiting';
                    })()
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isUrsusGoldenTime ? 'It\'s Ursus 2x Mesos!' : 'Until Ursus 2x Mesos'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold">
                {characters.length}
              </p>
              <p className="text-sm text-muted-foreground">Active Characters</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskStats;
