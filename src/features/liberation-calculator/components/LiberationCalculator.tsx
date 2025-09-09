import { useLiberationCalculator } from '../hooks/useLiberationCalculator';
import { LiberationCalculatorHeader } from './LiberationCalculatorHeader';
import LiberationStats from './LiberationStats';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MoreHorizontal, ChevronDown, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const LiberationCalculator = () => {
  const {
    liberationType,
    progress,
    schedule
  } = useLiberationCalculator();

  return (
    <>
      <LiberationCalculatorHeader />

      <LiberationStats
        progress={progress}
        schedule={schedule}
        liberationType={liberationType}
      />

      {/* Liberation Character Card */}
      <div className="relative">
        <Card className="card-gaming w-1/4 min-h-[calc(100vh-400px)] z-50 relative">
          <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
            <img
              src="/defaultchar.png"
              alt="Default Character"
              className="w-16 h-16 object-contain rounded opacity-50"
            />
            <div className="text-6xl text-muted-foreground">+</div>
          </CardContent>
        </Card>
        
        <Card className="card-gaming absolute top-0 left-1/4 w-3/4 h-[calc(100vh-440px)] z-10 relative">
          <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="text-4xl text-muted-foreground">+</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
