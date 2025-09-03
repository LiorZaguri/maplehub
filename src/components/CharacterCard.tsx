import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Pencil, MoreVertical, CheckSquare, XCircle } from 'lucide-react';
import { getLevelProgress } from '@/lib/levels';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { XIcon } from "lucide-react";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";

interface CharacterCardProps {
  character: {
    id: string;
    name: string;
    class: string;
    level: number;
    exp: number;
    avatarUrl?: string;
    isMain?: boolean;
    legionLevel?: number;
    raidPower?: number;
  };
  variant: 'roster' | 'boss-tracker';
  index?: number;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onEditBosses?: (characterName: string) => void;
  onRemove?: (characterId: string) => void;
  onMoreActions?: (characterName: string) => void;
  onToggleAllBosses?: (characterName: string, checkAll: boolean) => void;
  completionStats?: {
    completed: number;
    total: number;
    percentage: number;
  };
  allBossesChecked?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  variant,
  index = 0,
  onMoveUp,
  onMoveDown,
  onEditBosses,
  onRemove,
  onMoreActions,
  onToggleAllBosses,
  completionStats,
  allBossesChecked = false
}) => {
  const pct = getLevelProgress(character.level, character.exp || 0);

  return (
    <div className="border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors">
      
      <div className="flex h-4/6">
        {/* Character Image - Left Side (80% height) */}
        

        
        <div className="flex-shrink-0 h-4/5">
        
          <img
            src={character.avatarUrl || ''}
            alt={character.name}
            className="w-auto object-cover"
            onError={(e) => { 
              const img = e.currentTarget as HTMLImageElement; 
              img.src = '/placeholder.svg'; 
            }}
          />
        </div>
        
        {/* Character Information - Right Side */}
        <div className="flex-1 p-3 space-y-2 min-w-0">
          {/* Header with name, level, and class */}
          <div className="min-w-0 space-y-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
              <h3 className="font-medium text-primary text-base flex items-center gap-1">
                <span className="truncate">{character.name}</span>
                {character.isMain && variant === "boss-tracker" && (
                  <span className="text-amber-400 shrink-0" aria-label="Main" title="Main">★</span>
                )}
              </h3>
                
                <div className="text-sm text-muted-foreground">
                  Lv. {character.level} ({pct}%)
                </div>
                
                <div className="text-sm text-muted-foreground">{character.class}</div>
              </div>
              
              {/* Completion badge for boss tracker */}
              {variant === 'boss-tracker' && completionStats && (
                
                <div className="flex items-center gap-2 ml-2">
                  
                  <Badge className={completionStats.percentage === 100 ? 'progress-complete' : 'progress-partial'}>
                    {completionStats.completed}/{completionStats.total}
                  </Badge>
                  
                  {onToggleAllBosses && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title="More actions"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onToggleAllBosses(character.name, !allBossesChecked)}>
                          {allBossesChecked ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" /> Uncheck all
                            </>
                          ) : (
                            <>
                              <CheckSquare className="h-4 w-4 mr-2" /> Check all
                            </>
                          )}
                        </DropdownMenuItem>
                        {onEditBosses && (
                          <DropdownMenuItem onClick={() => onEditBosses(character.name)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit bosses (Roster)
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
              
            </div>
            
          </div>
          
          {/* Action buttons - Different for each variant */}
            
        </div>
        
        
      </div>
      {variant === 'roster' ? (
            <div className="pr-3 pl-3 flex items-center gap-2 pt-1 mt-auto">
              
              <Button
                variant="ghost"
                size="sm"
                title="Move up"
                onClick={() => onMoveUp?.(index)}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title="Move down"
                onClick={() => onMoveDown?.(index)}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title="Edit bosses"
                onClick={() => onEditBosses?.(character.name)}
                className="flex-1 text-xs"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    aria-label="Delete character"
                    title="Delete character"
                  >
                    <XIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {character.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the character from your roster. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => onRemove?.(character.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            // Boss tracker variant - no action buttons needed
            <div className="pt-2 mt-auto">
              
              {/* Content will be added by the parent component */}
            </div>
          )}
    </div>
  );
};

export default CharacterCard;
