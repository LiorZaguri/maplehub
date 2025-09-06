import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Trophy, Sword } from 'lucide-react';
import { RosterCharacter, BossInfo } from '@/types/bossTracker';
import { getCompletionStats } from '@/utils/bossUtils';

interface BossStatsProps {
  roster: RosterCharacter[];
  weeklyBosses: BossInfo[];
  dailyBosses: BossInfo[];
  monthlyBosses: BossInfo[];
  progressByCharacter: Record<string, Record<string, boolean>>;
  enabledByCharacter: Record<string, Record<string, boolean>>;
  partyByCharacter: Record<string, Record<string, number>>;
  getCollectedValue: (characterName: string, bossList: BossInfo[]) => number;
  getMaxPossibleValue: (characterName: string, bossList: BossInfo[]) => number;
  getWeeklyBossCount: (characterName: string) => number;
  timeUntilReset: string;
}

export const BossStats = ({
  roster,
  weeklyBosses,
  dailyBosses,
  monthlyBosses,
  progressByCharacter,
  enabledByCharacter,
  partyByCharacter,
  getCollectedValue,
  getMaxPossibleValue,
  getWeeklyBossCount,
  timeUntilReset
}: BossStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total meso collected:</p>
              <p className={`text-2xl font-bold ${(() => {
                // For total meso collected, include weekly + daily + checked monthly
                const totalCollected = roster.reduce((acc, c) => {
                  const weeklyDailyValue = getCollectedValue(c.name, [...weeklyBosses, ...dailyBosses]);
                  const monthlyValue = getCollectedValue(c.name, monthlyBosses);
                  return acc + weeklyDailyValue + monthlyValue;
                }, 0);
                // For max possible, include weekly + daily + checked monthly only
                const totalMax = roster.reduce((acc, c) => {
                  const weeklyDailyMax = getMaxPossibleValue(c.name, [...weeklyBosses, ...dailyBosses]);
                  // Only include monthly bosses that are actually checked
                  const monthlyMax = monthlyBosses.reduce((sum, b) => {
                    const isEnabled = enabledByCharacter[c.name]?.[b.name] ?? true;
                    const isChecked = progressByCharacter[c.name]?.[b.name] ?? false;
                    const party = partyByCharacter[c.name]?.[b.name] ?? 1;
                    const share = Math.floor(b.value / party);
                    return sum + (isEnabled && isChecked ? share : 0);
                  }, 0);
                  return acc + weeklyDailyMax + monthlyMax;
                }, 0);
                return totalCollected >= totalMax ? 'text-success' : '';
              })()}`}>{(() => {
                // For total meso collected, include weekly + daily + checked monthly
                const totalCollected = roster.reduce((acc, c) => {
                  const weeklyDailyValue = getCollectedValue(c.name, [...weeklyBosses, ...dailyBosses]);
                  const monthlyValue = getCollectedValue(c.name, monthlyBosses);
                  return acc + weeklyDailyValue + monthlyValue;
                }, 0);
                return totalCollected.toLocaleString();
              })()}</p>
              <p className="text-sm text-muted-foreground mt-1">Max possible meso:</p>
              <p className="text-xl font-bold">{(() => {
                // For max possible, include weekly + daily + checked monthly only
                const totalMax = roster.reduce((acc, c) => {
                  const weeklyDailyMax = getMaxPossibleValue(c.name, [...weeklyBosses, ...dailyBosses]);
                  // Only include monthly bosses that are actually checked
                  const monthlyMax = monthlyBosses.reduce((sum, b) => {
                    const isEnabled = enabledByCharacter[c.name]?.[b.name] ?? true;
                    const isChecked = progressByCharacter[c.name]?.[b.name] ?? false;
                    const party = partyByCharacter[c.name]?.[b.name] ?? 1;
                    const share = Math.floor(b.value / party);
                    return sum + (isEnabled && isChecked ? share : 0);
                  }, 0);
                  return acc + weeklyDailyMax + monthlyMax;
                }, 0);
                return totalMax.toLocaleString();
              })()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Weekly crystals remaining:</p>
              <p className={`text-2xl font-bold ${(() => {
                // For crystals remaining, count ALL checked bosses (weekly + daily + monthly)
                const allCheckedBosses = roster.reduce((acc, c) => {
                  const bosses = progressByCharacter[c.name] || {};
                  const checkedCount = [...weeklyBosses, ...dailyBosses, ...monthlyBosses]
                    .filter(b => (enabledByCharacter[c.name]?.[b.name] ?? true) && bosses[b.name]).length;
                  return acc + checkedCount;
                }, 0);
                const remaining = Math.max(0, 180 - allCheckedBosses);
                return remaining === 0 ? 'text-destructive' : '';
              })()}`}>{(() => {
                // For crystals remaining, count ALL checked bosses (weekly + daily + monthly)
                const allCheckedBosses = roster.reduce((acc, c) => {
                  const bosses = progressByCharacter[c.name] || {};
                  const checkedCount = [...weeklyBosses, ...dailyBosses, ...monthlyBosses]
                    .filter(b => (enabledByCharacter[c.name]?.[b.name] ?? true) && bosses[b.name]).length;
                  return acc + checkedCount;
                }, 0);
                const remaining = Math.max(0, 180 - allCheckedBosses);
                return `${remaining.toLocaleString()}`;
              })()}</p>
              <p className="text-sm text-muted-foreground mt-1">Weekly bosses available:</p>
              <p className={`text-xl font-bold ${(() => {
                // For weekly bosses available, count available bosses per character (limited to 14 each)
                const totalAvailable = roster.reduce((acc, c) => {
                  const weeklyDailyStats = getCompletionStats(c.name, [...weeklyBosses, ...dailyBosses], progressByCharacter, enabledByCharacter, {}, monthlyBosses);
                  const monthlyChecked = monthlyBosses.filter(b =>
                    (enabledByCharacter[c.name]?.[b.name] ?? true) &&
                    (progressByCharacter[c.name]?.[b.name] ?? false)
                  ).length;
                  // Each character can have max 14 bosses available
                  const characterTotal = Math.min(14, weeklyDailyStats.total + monthlyChecked);
                  return acc + characterTotal;
                }, 0);
                return totalAvailable > 180 ? 'text-destructive' : '';
              })()}`}>{(() => {
                // For weekly bosses available, count available bosses per character (limited to 14 each)
                const totalAvailable = roster.reduce((acc, c) => {
                  const weeklyDailyStats = getCompletionStats(c.name, [...weeklyBosses, ...dailyBosses], progressByCharacter, enabledByCharacter, {}, monthlyBosses);
                  const monthlyChecked = monthlyBosses.filter(b =>
                    (enabledByCharacter[c.name]?.[b.name] ?? true) &&
                    (progressByCharacter[c.name]?.[b.name] ?? false)
                  ).length;
                  // Each character can have max 14 bosses available
                  const characterTotal = Math.min(14, weeklyDailyStats.total + monthlyChecked);
                  return acc + characterTotal;
                }, 0);
                return `${totalAvailable.toLocaleString()} / 180`;
              })()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Sword className="h-8 w-8 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Total characters done:</p>
              <p className={`text-2xl font-bold ${(() => {
                const combined = [...weeklyBosses, ...dailyBosses];
                const done = roster.filter(r => getCompletionStats(r.name, combined, progressByCharacter, enabledByCharacter, {}, monthlyBosses).percentage === 100).length;
                const total = roster.length;
                return done === total && total > 0 ? 'text-success' : '';
              })()}`}>{(() => {
                const combined = [...weeklyBosses, ...dailyBosses];
                const done = roster.filter(r => getCompletionStats(r.name, combined, progressByCharacter, enabledByCharacter, {}, monthlyBosses).percentage === 100).length;
                const total = roster.length;
                return `${done} / ${total}`;
              })()}</p>
              <p className="text-sm text-muted-foreground mt-1">Weekly reset:</p>
              <p className="text-xl font-bold">{timeUntilReset}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
