import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RefreshCw } from 'lucide-react';
import { CharacterRegion } from '../types/roster';

interface AddCharacterFormProps {
  characterRegion: CharacterRegion;
  bulkNamesInput: string;
  isLoading: boolean;
  onRegionChange: (region: CharacterRegion) => void;
  onBulkNamesChange: (value: string) => void;
  onSubmit: () => void;
}

const AddCharacterForm: React.FC<AddCharacterFormProps> = ({
  characterRegion,
  bulkNamesInput,
  isLoading,
  onRegionChange,
  onBulkNamesChange,
  onSubmit,
}) => {
  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-primary" />
          <span>Add Character</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Region Selector */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Region:</span>
            <Select value={characterRegion} onValueChange={onRegionChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="na">NA</SelectItem>
                <SelectItem value="eu">EU</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isLoading) onSubmit();
            }}
            className="w-full flex gap-2"
          >
            <Input
              placeholder="Enter character name(s)"
              value={bulkNamesInput}
              onChange={(e) => onBulkNamesChange(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="btn-hero w-auto"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Advanced: To add multiple characters at once, you can enter their names separated by commas or spaces.
        </p>
      </CardContent>
    </Card>
  );
};

export default AddCharacterForm;
