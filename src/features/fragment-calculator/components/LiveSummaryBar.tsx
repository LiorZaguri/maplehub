import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveSummaryBarProps {
  totalFragments: number;
  estimatedDays: number;
  dailyRate: number;
  className?: string;
}

export const LiveSummaryBar = ({
  totalFragments,
  estimatedDays,
  dailyRate,
  className
}: LiveSummaryBarProps) => {

  const formatCompletionDate = (days: number) => {
    if (days <= 0) return 'Complete!';
    if (days < 1) return 'Today';
    if (days < 7) return `${Math.ceil(days)} days`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
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

      </CardContent>
    </Card>
  );
};
