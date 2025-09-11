import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FragmentRateCalculatorProps {
  totalFragments: number;
  estimatedDays: number;
  className?: string;
}

export const FragmentRateCalculator = ({
  totalFragments,
  estimatedDays,
  className
}: FragmentRateCalculatorProps) => {
  const [fragPerWap, setFragPerWap] = useState(40);
  const [wapsPerDay, setWapsPerDay] = useState(2);
  const [dailies, setDailies] = useState(12);
  const [weeklies, setWeeklies] = useState(55);

  const [totalFragsPerDay, setTotalFragsPerDay] = useState(0);
  const [daysToTarget, setDaysToTarget] = useState(0);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');

  useEffect(() => {
    // Calculate total fragments per day
    const wapFragsPerDay = fragPerWap * wapsPerDay;
    const dailyFragsPerDay = dailies;
    const weeklyFragsPerDay = weeklies / 7; // Convert weeklies to daily average
    
    const total = wapFragsPerDay + dailyFragsPerDay + weeklyFragsPerDay;
    setTotalFragsPerDay(total);

    // Calculate days to target
    if (total > 0) {
      const days = totalFragments / total;
      setDaysToTarget(days);

      // Calculate estimated completion date
      const today = new Date();
      const completionDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      setEstimatedCompletionDate(completionDate.toLocaleDateString());
    } else {
      setDaysToTarget(0);
      setEstimatedCompletionDate('');
    }
  }, [fragPerWap, wapsPerDay, dailies, weeklies, totalFragments]);

  const formatCompletionDate = (days: number) => {
    if (days <= 0) return 'Complete!';
    if (days < 1) return 'Today';
    if (days < 7) return `${Math.ceil(days)} days`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardContent className="p-4">
        {/* Summary Stats */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Fragments:</span>
            <Badge variant="secondary" className="font-mono">
              {totalFragments.toLocaleString()}
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Est. Completion:</span>
            <Badge variant="outline" className="font-mono">
              {formatCompletionDate(estimatedDays)}
            </Badge>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-muted-foreground/30 mb-4"></div>

        {/* Input Section */}
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
            <div className="text-center">frag/wap</div>
            <div className="text-center">waps/day</div>
            <div className="text-center">dailies</div>
            <div className="text-center">weeklies</div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Input
              type="number"
              value={fragPerWap}
              onChange={(e) => setFragPerWap(Number(e.target.value) || 0)}
              className="text-center"
              min="0"
            />
            <Input
              type="number"
              value={wapsPerDay}
              onChange={(e) => setWapsPerDay(Number(e.target.value) || 0)}
              className="text-center"
              min="0"
            />
            <Input
              type="number"
              value={dailies}
              onChange={(e) => setDailies(Number(e.target.value) || 0)}
              className="text-center"
              min="0"
            />
            <Input
              type="number"
              value={weeklies}
              onChange={(e) => setWeeklies(Number(e.target.value) || 0)}
              className="text-center"
              min="0"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-muted-foreground/30 my-3"></div>

        {/* Output Section */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Frags per Day:</span>
            <span className="font-mono font-medium">{totalFragsPerDay.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Days to Target:</span>
            <span className="font-mono font-medium">{daysToTarget.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Completion Date:</span>
            <span className="font-mono font-medium">{estimatedCompletionDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
