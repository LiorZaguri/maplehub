import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  avatarUrl?: string;
  isMain?: boolean;
}

interface CharacterGridProps {
  characters: Character[];
  selectedCharacter?: string;
  onCharacterSelect?: (characterName: string) => void;
  className?: string;
  showStats?: boolean;
  stats?: Record<string, { completed: number; total: number }>;
}

const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  selectedCharacter,
  onCharacterSelect,
  className = '',
  showStats = false,
  stats = {},
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 ${className}`}>
      {characters.map((character) => {
        const characterStats = stats[character.name];
        const isSelected = selectedCharacter === character.name;

        return (
          <Card
            key={character.id}
            className={`card-gaming cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onClick={() => onCharacterSelect?.(character.name)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <img
                  src={character.avatarUrl || '/placeholder.svg'}
                  alt={character.name}
                  className="w-10 h-10 object-cover rounded"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = '/placeholder.svg';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold truncate text-base ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {character.name}
                    </h3>
                    {character.isMain && (
                      <Star className={`h-3 w-3 flex-shrink-0 ${
                        isSelected ? 'text-primary' : 'text-amber-400'
                      }`} />
                    )}
                  </div>
                  <p className={`text-sm ${
                    isSelected ? 'text-primary/70' : 'text-muted-foreground'
                  }`}>
                    Lv. {character.level} • {character.class}
                  </p>
                </div>
              </div>
            </CardHeader>
            {showStats && characterStats && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {characterStats.completed}/{characterStats.total}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {characterStats.total > 0
                      ? Math.round((characterStats.completed / characterStats.total) * 100)
                      : 0}% done
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default CharacterGrid;
