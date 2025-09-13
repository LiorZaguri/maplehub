import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Gem, Zap, ChevronLeft, ChevronRight, ArrowUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { HEXASkill } from '../types';
import { PriorityScore } from '../utils/hexaPriority';
import { useState } from 'react';

interface NextUpgradeCardProps {
  nextUpgrade: HEXASkill | null;
  upcomingSkills?: PriorityScore[];
  onUpgrade?: () => void;
  onSetTarget?: () => void;
  isLoading?: boolean;
}

export const NextUpgradeCard = ({
  nextUpgrade,
  upcomingSkills = [],
  onUpgrade,
  onSetTarget,
  isLoading = false
}: NextUpgradeCardProps) => {
  const [isUpcomingSkillsOpen, setIsUpcomingSkillsOpen] = useState(false);
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


            {/* Upcoming Skills Collapsible */}
            {upcomingSkills && upcomingSkills.length > 0 && (
              <Collapsible 
                key={`upcoming-skills-${upcomingSkills.length}-${upcomingSkills[0]?.skill.id}`}
                open={isUpcomingSkillsOpen} 
                onOpenChange={setIsUpcomingSkillsOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between p-2 h-auto"
                  >
                    <span className="text-sm font-medium">Show all ({upcomingSkills.length})</span>
                    {isUpcomingSkillsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <div className="relative overflow-visible">
                     <div className="flex flex-wrap gap-1 p-3 bg-muted/30 rounded-lg relative">
                    {upcomingSkills.filter(skill => skill && skill.skill).map((prioritySkill, index) => {
                    
                      return (
                      <div key={`${prioritySkill.skill.id}-${prioritySkill.nextOptimalLevel}-${index}`} className="pt-1 relative group flex justify-center">
                        
                        <div className="relative w-8 h-8">
                          <img
                            src={`./skill-images/${prioritySkill.skill.icon}`}
                            alt={prioritySkill.skill.name}
                            className="w-8 h-8 rounded border border-border/50"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = './placeholder.svg';
                            }}
                          />
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4 min-w-[16px] flex items-center justify-center"
                          >
                            {prioritySkill.nextOptimalLevel || prioritySkill.skill.currentLevel + 1}
                          </Badge>
                          {index === 0 && (
                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full border border-background" />
                          )}
                        </div>
                        {/* Fixed tooltip positioning */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                          <div className="font-medium">{prioritySkill.skill.name}</div>
                          <div className="text-xs text-gray-300">
                            Lv.{prioritySkill.skill.currentLevel} → {prioritySkill.nextOptimalLevel || prioritySkill.skill.currentLevel + 1}
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                        </div>
                      {index < upcomingSkills.length - 1 && (
                        <div className="text-muted-foreground text-2xl">→</div>
                      )}
                      </div>
                      
                      );
                    })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

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