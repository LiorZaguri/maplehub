import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Gem, Zap } from 'lucide-react';

interface ProgressSummaryCardProps {
  fragmentsSpent: number;
  fragmentsTotal: number;
  solErdaSpent?: number;
  solErdaTotal?: number;
  isLoading?: boolean;
  error?: string;
}

export const ProgressSummaryCard = ({
  fragmentsSpent,
  fragmentsTotal,
  solErdaSpent = 0,
  solErdaTotal = 0,
  isLoading = false,
  error
}: ProgressSummaryCardProps) => {
  const fragmentsPercentage = fragmentsTotal > 0 ? (fragmentsSpent / fragmentsTotal) * 100 : 0;
  const fragmentsRemaining = fragmentsTotal - fragmentsSpent;
  const solErdaPercentage = solErdaTotal > 0 ? (solErdaSpent / solErdaTotal) * 100 : 0;
  const solErdaRemaining = solErdaTotal - solErdaSpent;

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <img 
                src="./skill-images/fragment.png" 
                alt="Fragment" 
                className="h-[27px] w-[27px]"
              />
            </div>
            <div>
              <CardTitle className="text-lg">
                HEXA Progression Summary
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track your 6th job journey
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                `${fragmentsPercentage.toFixed(1)}%`
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Complete
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fragments Progress */}
        <div className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-2 w-full" />
          ) : (
            <Progress value={fragmentsPercentage} className="h-2" />
          )}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{isLoading ? <Skeleton className="h-3 w-20" /> : `${fragmentsSpent.toLocaleString()} Fragments`}</span>
            <span>{isLoading ? <Skeleton className="h-3 w-20" /> : `Target: ${fragmentsRemaining.toLocaleString()} Fragments`}</span>
          </div>
        </div>

        {/* Sol Erda Progress */}
        {solErdaTotal > 0 && (
          <div className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-2 w-full" />
            ) : (
              <Progress value={solErdaPercentage} className="h-2" />
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isLoading ? <Skeleton className="h-3 w-20" /> : `${solErdaSpent.toLocaleString()} Sol Erda`}</span>
              <span>{isLoading ? <Skeleton className="h-3 w-20" /> : `Target: ${solErdaRemaining.toLocaleString()} Sol Erda`}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
