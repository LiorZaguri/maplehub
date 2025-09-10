import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Info } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { LegionRaidCharts } from '@/components/LegionRaidCharts';
import { getLevelProgress } from '@/lib/levels';
import { Character } from '../types/roster';

interface MainCharacterCardProps {
  mainCharacter: Character | undefined;
  mainLegion: number | undefined;
  mainRaidPower: number | undefined;
  onSelectForExpGraph: (character: Character) => void;
  onToast: (options: { title: string; description: string; variant?: string }) => void;
}

const MainCharacterCard: React.FC<MainCharacterCardProps> = ({
  mainCharacter,
  mainLegion,
  mainRaidPower,
  onSelectForExpGraph,
  onToast,
}) => {
  return (
    <Card className="card-gaming">
      <CardHeader className="relative">
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-amber-400" aria-hidden="true" />
          <span>Main Character</span>
        </CardTitle>
        <div className="absolute top-4 right-4">
          <HoverCard openDelay={0}>
            <HoverCardTrigger asChild>
              <div className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors cursor-help">
                <Info className="h-5 w-5 text-primary" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" side="bottom" align="end">
              <div className="space-y-2">
                <h4 className="font-semibold">Main Character</h4>
                <p className="text-sm text-muted-foreground">
                  Auto-detected as your highest-level character. Used for Legion and Raid Power calculations.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can manually set another Lv. 260+ character as main, but Legion/Raid Power won't be available for non-highest level characters.
                </p>
                <p className="text-sm text-muted-foreground">
                  Hover over the Exp Progress bar below to see ETA to next level.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>

      {mainCharacter ? (
        <CardContent
          className={`space-y-4 transition-colors duration-200 ${
            mainCharacter.level >= 260 ? 'cursor-pointer' : 'cursor-default'
          }`}
          onClick={() => {
            if (mainCharacter.level >= 260) {
              onSelectForExpGraph(mainCharacter);
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
          {/* Character Info Row */}
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <img
              src={mainCharacter.avatarUrl}
              alt={mainCharacter.name}
              className="w-22 h-22 rounded-md"
            />

            <div className="flex flex-col">
              {/* Name + Level/Class */}
              <span className="font-semibold text-lg text-white">
                {mainCharacter.name}
              </span>
              <span className="text-sm text-gray-400">
                Lv. {mainCharacter.level} ({getLevelProgress(mainCharacter.level, mainCharacter.exp)}%) — {mainCharacter.class}
              </span>

              {(mainCharacter as any).worldName && (
                <span className="text-xs text-muted-foreground/70">
                  {(mainCharacter as any).worldName}
                </span>
              )}
            </div>
          </div>

          {/* Legion and Raid Power Charts */}
          <LegionRaidCharts
            legionLevel={mainLegion}
            raidPower={mainRaidPower}
            level={mainCharacter.level}
            exp={mainCharacter.exp}
            expData={(mainCharacter as any).additionalData?.expData}
          />
        </CardContent>
      ) : (
        <CardContent className="text-sm text-gray-400">
          No main character detected.
          <p className='text-xs'>We auto-detect the main character as the highest-level on the account.</p>
        </CardContent>
      )}
    </Card>
  );
};

export default MainCharacterCard;
