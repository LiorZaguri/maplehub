import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Sword, Calendar, Trophy, RotateCcw, Pencil, MoreVertical, CheckSquare, XCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { getBossMeta, formatMesos, listAllBosses } from '@/lib/bossData';
import { getLevelProgress } from '@/lib/levels';

interface RosterCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  exp: number;
  avatarUrl?: string;
}

interface BossInfo {
  name: string;
  value: number; // mesos value approximation
  defaultParty: number;
}

interface CharacterBossProgress {
  [bossName: string]: boolean;
}

type BossProgressByCharacter = Record<string, CharacterBossProgress>;
type BossEnabledByCharacter = Record<string, CharacterBossProgress>;
type CharacterExpMap = Record<string, number>;
type BossPartyByCharacter = Record<string, Record<string, number>>;

type FilterType = 'all' | 'finished' | 'unfinished';



const BossTracker = () => {
  const { toast } = useToast();
  const SHOW_BOSS_ICONS = true; // Re-enable icons now that we use local assets
  const navigate = useNavigate();
  
  // Build weekly/daily boss lists from the full dataset
  const allBosses = useMemo(() => listAllBosses(), []);
  const dailyVariantSet = useMemo(() => new Set<string>([
    'Normal Zakum',
    'Normal Magnus',
    'Normal Hilla',
    'Normal Papulatus',
    'Normal Pierre',
    'Normal Von Bon',
    'Normal Crimson Queen',
    'Normal Vellum',
    'Normal Von Leon',
    'Hard Von Leon',
    'Normal Horntail',
    'Chaos Horntail',
    'Easy Arkarium',
    'Normal Arkarium',
    'Normal Pink Bean',
    'Normal Ranmaru',
    'Hard Ranmaru',
    'Normal Gollux',
  ]), []);
  const isMonthlyBase = (base: string) => base.includes('Black Mage');
  const parseBase = (name: string) => {
    const parts = name.split(' ');
    return parts.slice(1).join(' ');
  };
  const parseBoss = (fullName: string): { difficulty: string; base: string } => {
    const parts = fullName.split(' ');
    const difficulty = parts[0];
    const base = parts.slice(1).join(' ');
    return { difficulty, base };
  };
  const weeklyBosses: BossInfo[] = useMemo(() => {
    return allBosses
      .filter(b => {
        const base = parseBase(b.name);
        return !dailyVariantSet.has(b.name) && !isMonthlyBase(base);
      })
      .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
  }, [allBosses, dailyVariantSet]);
  const dailyBosses: BossInfo[] = useMemo(() => {
    return allBosses
      .filter(b => dailyVariantSet.has(b.name))
      .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
  }, [allBosses, dailyVariantSet]);
  const monthlyBosses: BossInfo[] = useMemo(() => {
    return allBosses
      .filter(b => isMonthlyBase(parseBase(b.name)))
      .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
  }, [allBosses]);



  // Single combined view (no tabs)

  // Load roster from localStorage to render columns per character like the reference
  const roster: RosterCharacter[] = useMemo(() => {
    try {
      const stored = localStorage.getItem('maplehub_roster');
      if (!stored) return [];
      const parsed = JSON.parse(stored) as Array<any>;
      return parsed.map((c) => ({ id: c.id, name: c.name, class: c.class, level: c.level, avatarUrl: c.avatarUrl, exp: c.exp }));
    } catch {
      return [];
    }
  }, []);

  // progress keyed by character name → bossName → checked
  const [progressByCharacter, setProgressByCharacter] = useState<BossProgressByCharacter>(() => {
    try {
      const stored = localStorage.getItem('maplehub_boss_progress');
      return stored ? (JSON.parse(stored) as BossProgressByCharacter) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_boss_progress', JSON.stringify(progressByCharacter));
    } catch {
      // ignore
    }
  }, [progressByCharacter]);

  // Per-character enabled matrix seeded from bossconfig.txt defaults (true/false)
  const [enabledByCharacter, setEnabledByCharacter] = useState<BossEnabledByCharacter>(() => {
    try {
      const stored = localStorage.getItem('maplehub_boss_enabled');
      return stored ? (JSON.parse(stored) as BossEnabledByCharacter) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_boss_enabled', JSON.stringify(enabledByCharacter));
    } catch {
      // ignore
    }
  }, [enabledByCharacter]);

  // Character EXP storage for level percentage
  const [charExp, setCharExp] = useState<CharacterExpMap>(() => {
    try {
      const stored = localStorage.getItem('maplehub_char_exp');
      return stored ? (JSON.parse(stored) as CharacterExpMap) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_char_exp', JSON.stringify(charExp));
    } catch {
      // ignore
    }
  }, [charExp]);

  // Per-character party sizes for each boss variant (1-6)
  const [partyByCharacter, setPartyByCharacter] = useState<BossPartyByCharacter>(() => {
    try {
      const stored = localStorage.getItem('maplehub_boss_party');
      return stored ? (JSON.parse(stored) as BossPartyByCharacter) : {};
    } catch {
      return {};
    }
  });

  // Filter state for boss display
  const [bossFilter, setBossFilter] = useState<FilterType>('all');

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_boss_party', JSON.stringify(partyByCharacter));
    } catch {
      // ignore
    }
  }, [partyByCharacter]);

  const getPartySize = (characterName: string, bossName: string): number => {
    const pc = partyByCharacter[characterName];
    const n = pc?.[bossName];
    if (!n || !Number.isFinite(n)) return 1;
    return Math.min(6, Math.max(1, Math.floor(n)));
  };

  const toggleBossComplete = (characterName: string, bossName: string) => {
    setProgressByCharacter((prev) => {
      const current = prev[characterName] || {};
      return {
        ...prev,
        [characterName]: {
          ...current,
          [bossName]: !current[bossName],
        },
      };
    });
  };

  const toggleBossEnabled = (characterName: string, bossName: string, defaultEnabled = true) => {
    setEnabledByCharacter((prev) => {
      const current = prev[characterName] || {};
      const currentVal = bossName in current ? current[bossName] : defaultEnabled;
      return {
        ...prev,
        [characterName]: {
          ...current,
          [bossName]: !currentVal,
        },
      };
    });
  };

  const isBossEnabledForCharacter = (characterName: string, bossName: string): boolean => {
    const enabled = enabledByCharacter[characterName] || {};
    const hasAny = Object.keys(enabled).length > 0;
    const meta = getBossMeta(bossName);
    return hasAny ? !!enabled[bossName] : (meta?.defaultEnabled ?? true);
  };

  const getCompletionStats = (characterName: string, bossList: BossInfo[]) => {
    const bosses = progressByCharacter[characterName] || {};
    const considered = bossList.filter(b => isBossEnabledForCharacter(characterName, b.name));
    const completed = considered.filter(b => bosses[b.name]).length;
    const total = considered.length;
    return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 };
  };

  const getCollectedValue = (characterName: string, bossList: BossInfo[]) => {
    const bosses = progressByCharacter[characterName] || {};
    return bossList.reduce((sum, b) => {
      const isEnabled = isBossEnabledForCharacter(characterName, b.name);
      const party = getPartySize(characterName, b.name);
      const share = Math.floor(b.value / party);
      return sum + (isEnabled && bosses[b.name] ? share : 0);
    }, 0);
  };
  
  const getMaxPossibleValue = (characterName: string, bossList: BossInfo[]) => {
    return bossList.reduce((sum, b) => {
      const isEnabled = isBossEnabledForCharacter(characterName, b.name);
      const party = getPartySize(characterName, b.name);
      const share = Math.floor(b.value / party);
      return sum + (isEnabled ? share : 0);
    }, 0);
  };

  // Filter characters based on completion status
  const getFilteredCharacters = (characters: RosterCharacter[], bossList: BossInfo[]): RosterCharacter[] => {
    switch (bossFilter) {
      case 'finished':
        return characters.filter(char => {
          const stats = getCompletionStats(char.name, bossList);
          return stats.percentage === 100 && stats.total > 0;
        });
      case 'unfinished':
        return characters.filter(char => {
          const stats = getCompletionStats(char.name, bossList);
          return stats.percentage < 100 || stats.total === 0;
        });
      case 'all':
      default:
        return characters;
    }
  };

  const openBossEditor = (characterName: string) => {
    // Navigate to Roster page and auto-open Edit Bosses dialog for this character
    navigate(`/?editBosses=${encodeURIComponent(characterName)}`);
  };
  const resetAllProgress = () => {
    const combined = [...weeklyBosses, ...dailyBosses];
    setProgressByCharacter((prev) => {
      const next: BossProgressByCharacter = {};
      Object.keys(prev).forEach((name) => {
        const bosses = prev[name] || {};
        const updated: CharacterBossProgress = { ...bosses };
        combined.forEach((b) => { updated[b.name] = false; });
        next[name] = updated;
      });
      return next;
    });
    toast({ title: 'Reset', description: 'All boss progress has been reset!', className: 'progress-complete' });
  };

  const CharacterPanel = ({ characterName, characterClass, level, exp, bossList }: {
    characterName: string;
    characterClass: string;
    level: number;
    exp: number;
    bossList: BossInfo[];
  }) => {
    const stats = getCompletionStats(characterName, bossList);
    const visibleBosses = bossList.filter((b) => isBossEnabledForCharacter(characterName, b.name));
    const allChecked = visibleBosses.length > 0 && visibleBosses.every(b => (progressByCharacter[characterName] || {})[b.name]);
    const someChecked = visibleBosses.some(b => (progressByCharacter[characterName] || {})[b.name]);
    const toggleAllVisible = (next: boolean) => {
      setProgressByCharacter((prev) => {
        const current = prev[characterName] || {};
        const updated: CharacterBossProgress = { ...current };
        visibleBosses.forEach(b => { updated[b.name] = next; });
        return { ...prev, [characterName]: updated };
      });
    };
    const collected = getCollectedValue(characterName, bossList);
    const maxPossible = getMaxPossibleValue(characterName, bossList);
    const pct = getLevelProgress(level, exp || 0);
    const setExp = () => {
      const val = window.prompt(`Enter current EXP for ${characterName} (level ${level})`);
      if (!val) return;
      const num = Number(val);
      if (!Number.isFinite(num)) return;
      setCharExp((prev) => ({ ...prev, [characterName]: Math.max(0, Math.floor(num)) }));
    };

    const fallbackImg = "/placeholder.svg";
    return (
      <Card className="card-gaming">
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={(() => {
                  const c = roster.find(r => r.name === characterName);
                  const url = c?.avatarUrl || '';
                  const updated = ((): string => {
                    try {
                      const stored = localStorage.getItem('maplehub_roster');
                      const parsed: any[] = stored ? JSON.parse(stored) : [];
                      const me = parsed.find(x => x.name === characterName);
                      return me?.lastUpdated ? `?t=${encodeURIComponent(me.lastUpdated)}` : '';
                    } catch { return ''; }
                  })();
                  return url ? `${url}${updated}` : '';
                })()}
                alt={characterName}
                className="h-14 w-auto rounded-none"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src !== window.location.origin + '/placeholder.svg') {
                    img.src = '/placeholder.svg';
                  }
                }}
              />
              <div className="leading-tight">
                <CardTitle className="text-lg text-primary m-0 p-0">{characterName}</CardTitle>
                <div className="text-sm text-muted-foreground">
                    Lv. {level} ({pct}%)
                </div>
                <div className="text-sm">{characterClass}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={stats.percentage === 100 ? 'progress-complete' : 'progress-partial'}>
                {stats.completed}/{stats.total}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" title="More actions">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleAllVisible(!allChecked)}>
                    {allChecked ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" /> Uncheck all
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" /> Check all
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openBossEditor(characterName)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit bosses (Roster)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-hidden">
          <Table className="w-full table-fixed text-sm leading-tight">
            <TableHeader>
              <TableRow>
                <TableHead className="w-6 p-0.5"></TableHead>
                <TableHead className="p-0.5">Boss</TableHead>
                <TableHead className="w-10 md:w-14 text-center p-0.5">Party</TableHead>
                <TableHead className="w-24 md:w-28 text-right p-0.5">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBosses
                .sort((a, z) => z.value - a.value)
                .map((b) => {
                const meta = getBossMeta(b.name);
                return (
                  <TableRow key={b.name} className={`hover:bg-muted/50 h-7`}>
                    <TableCell className="p-0">
                      <Checkbox
                        checked={(progressByCharacter[characterName] || {})[b.name] || false}
                        disabled={false}
                        onCheckedChange={() => toggleBossComplete(characterName, b.name)}
                        className="h-4 w-4 data-[state=checked]:bg-success data-[state=checked]:border-success"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-primary p-0">
                      <div className="flex items-center gap-1 min-w-0">
                        {SHOW_BOSS_ICONS && meta?.imageUrl && (
                          <img
                            src={meta.imageUrl}
                            alt={b.name}
                            className="h-4 w-4 rounded-sm"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (img.src !== window.location.origin + fallbackImg) {
                                img.src = fallbackImg;
                              }
                            }}
                          />
                        )}
                        <span className="truncate whitespace-nowrap max-w-[120px] md:max-w-[170px] text-sm">{b.name}</span>

                      </div>
                    </TableCell>
                    <TableCell className="text-center p-0 text-sm">{getPartySize(characterName, b.name)}</TableCell>
                    <TableCell className="text-right font-mono p-0 text-sm">{formatMesos(Math.floor(b.value / getPartySize(characterName, b.name)))}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="hover:bg-muted/50 border-b-0 h-7">
                <TableCell colSpan={2} className="text-right text-muted-foreground p-0 text-sm">Collected</TableCell>
                <TableCell colSpan={2} className="text-right font-mono text-accent p-0 text-sm">{formatMesos(collected)}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/50 border-b-0 h-7">
                <TableCell colSpan={2} className="text-right text-muted-foreground p-0 text-sm">Max Possible</TableCell>
                <TableCell colSpan={2} className="text-right font-mono p-0 text-sm">{formatMesos(maxPossible)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Boss Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track weekly and daily boss completions across all characters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total meso collected:</p>
                <p className={`text-2xl font-bold ${(() => {
                  const combined = [...weeklyBosses, ...dailyBosses];
                  const sum = roster.reduce((acc, c) => acc + getCollectedValue(c.name, combined), 0);
                  const maxSum = roster.reduce((acc, c) => acc + getMaxPossibleValue(c.name, combined), 0);
                  return sum >= maxSum ? 'text-success' : '';
                })()}`}>{(() => {
                  // Header collected: track weekly/daily only
                  const combined = [...weeklyBosses, ...dailyBosses];
                  const sum = roster.reduce((acc, c) => acc + getCollectedValue(c.name, combined), 0);
                  return sum.toLocaleString();
                })()}</p>
                <p className="text-sm text-muted-foreground mt-1">Max possible meso:</p>
                <p className="text-xl font-bold">{(() => {
                  const combined = [...weeklyBosses, ...dailyBosses];
                  const maxSum = roster.reduce((acc, c) => acc + getMaxPossibleValue(c.name, combined), 0);
                  return maxSum.toLocaleString();
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
                <p className="text-sm text-muted-foreground">Total crystals remaining:</p>
                <p className={`text-2xl font-bold ${(() => {
                  const combined = [...weeklyBosses, ...dailyBosses];
                  const totals = roster.reduce((acc, c) => {
                    const stats = getCompletionStats(c.name, combined);
                    return { completed: acc.completed + stats.completed, total: acc.total + stats.total };
                  }, { completed: 0, total: 0 });
                  const remaining = Math.max(0, 180 - totals.completed);
                  return remaining === 0 ? 'text-destructive' : '';
                })()}`}>{(() => {
                  const combined = [...weeklyBosses, ...dailyBosses];
                  const totals = roster.reduce((acc, c) => {
                    const stats = getCompletionStats(c.name, combined);
                    return { completed: acc.completed + stats.completed, total: acc.total + stats.total };
                  }, { completed: 0, total: 0 });
                  const remaining = Math.max(0, 180 - totals.completed);
                  return `${remaining.toLocaleString()}`;
                })()}</p>
                <p className="text-sm text-muted-foreground mt-1">Max possible crystals to sell:</p>
                <p className={`text-xl font-bold ${(() => {
                  const combined = [...weeklyBosses, ...dailyBosses];
                  const totals = roster.reduce((acc, c) => {
                    const stats = getCompletionStats(c.name, combined);
                    return { completed: acc.completed + stats.completed, total: acc.total + stats.total };
                  }, { completed: 0, total: 0 });
                  return totals.total > 180 ? 'text-destructive' : '';
                })()}`}>{(() => {
                  const combined = [...weeklyBosses, ...dailyBosses];
                  const totals = roster.reduce((acc, c) => {
                    const stats = getCompletionStats(c.name, combined);
                    return { completed: acc.completed + stats.completed, total: acc.total + stats.total };
                  }, { completed: 0, total: 0 });
                  return `${totals.total.toLocaleString()} / 180`;
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
                  const done = roster.filter(r => getCompletionStats(r.name, combined).percentage === 100).length;
                  const total = roster.length;
                  return done === total && total > 0 ? 'text-success' : '';
                })()}`}>{(() => {
                  const combined = [...weeklyBosses, ...dailyBosses];
                  const done = roster.filter(r => getCompletionStats(r.name, combined).percentage === 100).length;
                  const total = roster.length;
                  return `${done} / ${total}`;
                })()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter characters:</span>
            <ToggleGroup type="single" value={bossFilter} onValueChange={(value) => setBossFilter(value as FilterType || 'all')}>
              <ToggleGroupItem value="all" size="sm">All</ToggleGroupItem>
              <ToggleGroupItem value="finished" size="sm">Finished</ToggleGroupItem>
              <ToggleGroupItem value="unfinished" size="sm">Unfinished</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {roster.length === 0 && (
            <Card className="card-gaming"><CardContent className="pt-6">Add characters in Roster to start tracking.</CardContent></Card>
          )}
          {getFilteredCharacters(roster, [...weeklyBosses, ...dailyBosses, ...monthlyBosses]).map((c) => (
            <CharacterPanel key={c.id} characterName={c.name} exp={c.exp} characterClass={c.class} level={c.level} bossList={[...weeklyBosses, ...dailyBosses, ...monthlyBosses]} />
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={resetAllProgress} variant="outline" size="sm" className="text-muted-foreground hover:text-primary">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset All
          </Button>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default BossTracker;