import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import CharacterCard from '@/components/CharacterCard';
import { Character } from '../types/roster';

interface CharacterGridProps {
  characters: Character[];
  selectedExpCharacter: Character | null;
  onSelectForExpGraph: (character: Character) => void;
  onMoveCharacter: (fullIndex: number, direction: number) => void;
  onEditBosses: (characterName: string) => void;
  onRemoveCharacter: (characterId: string) => void;
  onSetAsMain: (characterId: string) => void;
  onToast: (options: { title: string; description: string; variant?: string }) => void;
}

const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  selectedExpCharacter,
  onSelectForExpGraph,
  onMoveCharacter,
  onEditBosses,
  onRemoveCharacter,
  onSetAsMain,
  onToast,
}) => {
  return (
    <Card className="card-gaming">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-primary" />
          <span>Characters ({characters.length})</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          You can click on a Lv. 260+ character to view their experience graph
        </p>
      </CardHeader>
      <CardContent>
        {/* Character Cards - Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {characters
            .map((character, fullIndex) => ({ character, fullIndex }))
            .map(({ character, fullIndex }, filteredIndex) => (
              <div
                key={character.id}
                className={`transition-transform duration-200 rounded-lg ${
                  character.level >= 260 ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                } ${
                  selectedExpCharacter?.id === character.id
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : ''
                }`}
                onClick={() => {
                  if (character.level >= 260) {
                    onSelectForExpGraph(character);
                  } else {
                    onToast({
                      title: "Level Requirement",
                      description: "Character must be level 260+ to view exp graph",
                      variant: "destructive"
                    });
                  }
                }}
                title="Click to view experience graph"
              >
                <CharacterCard
                  character={character}
                  variant="roster"
                  index={filteredIndex}
                  onMoveUp={() => onMoveCharacter(fullIndex, -1)}
                  onMoveDown={() => onMoveCharacter(fullIndex, 1)}
                  onEditBosses={() => onEditBosses(character.name)}
                  onRemove={() => onRemoveCharacter(character.id)}
                  onSetAsMain={onSetAsMain}
                />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterGrid;
