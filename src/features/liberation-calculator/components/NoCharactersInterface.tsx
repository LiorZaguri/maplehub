import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export const NoCharactersInterface = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Characters Available</h3>
          <p className="text-muted-foreground mb-6">
            You need to add characters to your roster first. Go to the Roster page to add your MapleStory characters.
          </p>
          <Button asChild>
            <a href="/#roster">Go to Roster</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
