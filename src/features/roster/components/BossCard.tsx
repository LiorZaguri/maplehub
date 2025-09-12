import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMaxPartySize } from '@/lib/bossData';
import { getCharacterWorldMultiplier } from '@/features/boss-tracker/utils/bossUtils';
import { Character } from '../types/roster';

export interface BossVariant {
  name: string;
  difficulty: string;
  mesos: number;
  imageUrl: string;
}

export interface BossCardProps {
  base: string;
  variants: BossVariant[];
  isSelected: boolean;
  selectedVariant: string;
  partySize: number;
  category: 'monthly' | 'weekly' | 'daily';
  characters: Character[];
  characterName: string | null;
  onToggle: () => void;
  onVariantChange: (variant: string) => void;
  onPartySizeChange: (newSize: number) => void;
  onToast: (options: { title: string; description: string; variant?: "default" | "destructive" }) => void;
}

const BossCard: React.FC<BossCardProps> = ({
  base,
  variants,
  isSelected,
  selectedVariant,
  partySize,
  category,
  characters,
  characterName,
  onToggle,
  onVariantChange,
  onPartySizeChange,
  onToast,
}) => {
  const currentVariant = variants.find(v => v.name === selectedVariant) || variants[0];
  
  // Determine world multiplier based on character's world
  const worldMultiplier = getCharacterWorldMultiplier(
    characters.find(c => c.name === characterName) || characters[0]
  );
  
  const mesosShare = currentVariant 
    ? Math.floor((currentVariant.mesos / Math.max(1, partySize)) * worldMultiplier) 
    : 0;

  const handleToggle = () => {
    const isWeekly = category === 'weekly';
    const isDaily = category === 'daily';
    
    // Note: Weekly count validation should be handled by parent component
    // since it needs access to the full state
    onToggle();
  };

  const handlePartySizeDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSize = Math.max(1, partySize - 1);
    onPartySizeChange(newSize);
  };

  const handlePartySizeIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    const maxSize = getMaxPartySize(currentVariant?.name || '');
    const newSize = Math.min(maxSize, partySize + 1);
    onPartySizeChange(newSize);
  };

  return (
    <div
      className={`relative rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      )}

      <div className="p-4 cursor-pointer" onClick={handleToggle}>
        {/* Boss Image */}
        <div className="flex justify-center mb-3">
          <div className="relative p-2 bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/50">
            <img
              src={variants[0].imageUrl}
              alt={base}
              className="h-6 w-6 rounded-sm object-cover border border-border/30"
              style={{
                imageRendering: 'pixelated'
              }}
              onError={(e) => { 
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; 
              }}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Boss Name */}
        <h3 className="font-semibold text-sm text-center mb-2 text-primary truncate">
          {base}
        </h3>

        {/* Difficulty Selector */}
        <div className="mb-3">
          <Select
            value={selectedVariant}
            onValueChange={onVariantChange}
          >
            <SelectTrigger className="w-full h-8 text-xs" aria-label="Select boss variant">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {variants.map(v => (
                <SelectItem key={v.name} value={v.name} className="text-xs">
                  {v.difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Party Size */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Party:</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handlePartySizeDecrease}
            >
              -
            </Button>
            <span className="text-xs w-6 text-center">{partySize}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handlePartySizeIncrease}
            >
              +
            </Button>
          </div>
        </div>

        {/* Mesos Estimate */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Est. Mesos</div>
          <div className="font-semibold text-sm text-primary">
            {mesosShare.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BossCard;
