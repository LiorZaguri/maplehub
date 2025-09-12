import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Gem, Zap, ChevronLeft, ChevronRight, ArrowUp, Info } from 'lucide-react';
import { HEXASkill } from '../types';

interface NextUpgradeCardProps {
  nextUpgrade: HEXASkill | null;
  onUpgrade?: () => void;
  onSetTarget?: () => void;
  isLoading?: boolean;
}

export const NextUpgradeCard = ({
  nextUpgrade,
  onUpgrade,
  onSetTarget,
  isLoading = false
}: NextUpgradeCardProps) => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3 relative pr-12">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-primary" />
          Next Upgrade Priority
        </CardTitle>
        <div className="absolute top-4 right-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                <Info className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Calculation Basis</h4>
                <p className="text-xs text-muted-foreground">
                  Priorities were computed assuming ~80–85k Normal power at 380 PDR. 
                </p>
                <p className="text-xs text-muted-foreground">Because this model is an approximation, the priority order isn't guaranteed to be 100% accurate.</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
              <div className="space-y-1 flex-1">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
                <div className="h-3 bg-muted rounded animate-pulse w-16" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded animate-pulse flex-1" />
              <div className="h-8 bg-muted rounded animate-pulse flex-1" />
            </div>
          </div>
        ) : !nextUpgrade ? (
          <div className="text-center py-6">
            <div className="text-muted-foreground mb-2">🎉</div>
            <p className="text-sm text-muted-foreground">All skills are at target level!</p>
            <p className="text-xs text-muted-foreground mt-1">Time to rest and enjoy your progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Skill Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={`./skill-images/${nextUpgrade.icon}`}
                  alt={nextUpgrade.name}
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = './placeholder.svg';
                  }}
                />
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4"
                >
                  {nextUpgrade.currentLevel}
                </Badge>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{nextUpgrade.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Level {nextUpgrade.currentLevel} → {nextUpgrade.targetLevel}
                </p>
              </div>
            </div>

            {/* Costs */}
            {nextUpgrade.costs && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img 
                      src="./skill-images/fragment.png" 
                      alt="Fragment" 
                      className="h-[27px] w-[27px]"
                    />
                    <span>Fragments Required</span>
                  </div>
                  <span className="font-medium">{nextUpgrade.costs.fragments.toLocaleString()}</span>
                </div>
                {nextUpgrade.costs.solErda > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <img 
                        src="./skill-images/sol_erda.png" 
                        alt="Sol Erda" 
                        className="h-[27px] w-[27px]"
                      />
                      <span>Sol Erda Required</span>
                    </div>
                    <span className="font-medium">{nextUpgrade.costs.solErda.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={onSetTarget}
                disabled={!nextUpgrade || nextUpgrade.currentLevel >= nextUpgrade.maxLevel}
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};