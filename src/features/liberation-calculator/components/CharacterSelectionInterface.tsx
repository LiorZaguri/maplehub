import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { Character } from '@/features/roster/types/roster';
import { LiberationType } from '../types/liberation';

interface CharacterSelectionInterfaceProps {
  eligibleCharacters: Character[];
  selectedCharacterId: string;
  liberationType: LiberationType;
  onCharacterSelect: (characterId: string) => void;
  onStartConfiguration: () => void;
  onSkipToManual: () => void;
}

export const CharacterSelectionInterface = ({
  eligibleCharacters,
  selectedCharacterId,
  liberationType,
  onCharacterSelect,
  onStartConfiguration,
  onSkipToManual
}: CharacterSelectionInterfaceProps) => {
  return (
    <div className="max-w-7xl mx-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Character Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Select a level 255+ character to configure your liberation progress.
            This will help you track your boss clears and calculate completion time.
          </p>

          <div className="space-y-3">
            <Label htmlFor="character-select">Available Characters (Level 255+)</Label>
            <Select value={selectedCharacterId} onValueChange={onCharacterSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a character..." />
              </SelectTrigger>
              <SelectContent>
                {eligibleCharacters.map((character) => (
                  <SelectItem key={character.id} value={character.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{character.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Lv. {character.level}
                      </Badge>
                      {character.isMain && (
                        <Badge variant="default" className="text-xs">
                          Main
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCharacterId && (
            <div className="pt-4 border-t">
              <Button
                onClick={onStartConfiguration}
                className="w-full"
              >
                Start Configuration
              </Button>
            </div>
          )}

          <div className="pt-4 border-t text-center space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Don't see your character? Make sure they're added to your roster and at level 255+.
              </p>
              <Button variant="outline" asChild className="mr-2">
                <a href="/#roster">Manage Characters</a>
              </Button>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm text-muted-foreground mb-2">
                Or configure manually without selecting a character:
              </p>
              <Button
                variant="ghost"
                onClick={onSkipToManual}
                className="text-sm"
              >
                Skip & Configure Manually
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
