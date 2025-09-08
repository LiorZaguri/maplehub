import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { RosterCharacter } from '../types/bossTracker';

interface CharacterReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characters: RosterCharacter[];
  onCharactersChange: (characters: RosterCharacter[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CharacterReorderDialog = ({
  open,
  onOpenChange,
  characters,
  onCharactersChange,
  onSave,
  onCancel,
}: CharacterReorderDialogProps) => {
  const moveCharacter = (fromIndex: number, toIndex: number) => {
    const newOrder = [...characters];
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
    onCharactersChange(newOrder);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reorder Characters</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Use the up/down buttons to change the order of characters in the Boss Tracker
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
            {characters.map((character, index) => (
              <div
                key={character.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-2 flex-1">
                  <img
                    src={character.avatarUrl || '/placeholder.svg'}
                    alt={character.name}
                    className="w-8 h-8 rounded object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{character.name}</span>
                      {character.isMain && <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lv. {character.level} • {character.class}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground w-8 text-center">#{index + 1}</span>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (index > 0) {
                          moveCharacter(index, index - 1);
                        }
                      }}
                      disabled={index === 0}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (index < characters.length - 1) {
                          moveCharacter(index, index + 1);
                        }
                      }}
                      disabled={index === characters.length - 1}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className="btn-hero"
            >
              Save Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
