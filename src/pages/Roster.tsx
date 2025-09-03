import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Plus, RefreshCw, User, Clock, Pencil, XIcon, ArrowUp, ArrowDown, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { listAllBosses } from '@/lib/bossData';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input as UiInput } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLevelProgress } from '@/lib/levels';
import CharacterCard from '@/components/CharacterCard';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";

interface Character {
  id: string;
  name: string;
  class: string;
  exp: number;
  level: number;
  reboot: boolean;
  lastUpdated: string;
  avatarUrl?: string;
  isMain: boolean;
  legionLevel?: number;
  raidPower?: number;
};


const Roster = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("maplehub_roster") || "[]") as Character[];
      const seen = new Set<string>();
      const withIds = stored.map((c) => {
        let id = c.id;
        if (!id || seen.has(id)) {
          id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
        }
        seen.add(id);
        return { ...c, id };
      });
      // Persist back if we added/fixed any ids
      if (withIds.some((c, i) => c.id !== stored[i]?.id)) {
        localStorage.setItem("maplehub_roster", JSON.stringify(withIds));
      }
      return withIds;
    } catch {
      return [];
    }
  });
  const [newCharacterName, setNewCharacterName] = useState('');
  const [bulkNamesInput, setBulkNamesInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBossDialogOpen, setIsBossDialogOpen] = useState(false);
  const [pendingCharacterName, setPendingCharacterName] = useState<string | null>(null);
  const [pendingBulkNames, setPendingBulkNames] = useState<string[] | null>(null);
  const allBosses = listAllBosses();
  const [selectedBossEnabled, setSelectedBossEnabled] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allBosses.forEach(b => { initial[b.name] = b.defaultEnabled; });
    return initial;
  });
  const [partySizes, setPartySizes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    allBosses.forEach(b => { initial[b.name] = 1; });
    return initial;
  });
  const [selectedVariantByBase, setSelectedVariantByBase] = useState<Record<string, string>>({});
  const [baseEnabledByBase, setBaseEnabledByBase] = useState<Record<string, boolean>>({});
  const makeGroupKey = (category: 'monthly' | 'weekly' | 'daily', base: string) => `${category}:${base}`;

  const parseBoss = (fullName: string): { difficulty: string; base: string } => {
    const parts = fullName.split(' ');
    const difficulty = parts[0];
    const base = parts.slice(1).join(' ');
    return { difficulty, base };
  };

  
  const handleBulkAdd = async () => {
    const names = Array.from(new Set(bulkNamesInput
      .split(/(?:,|\s|&nbsp;|\u00A0)+/)
      .map(n => n.trim())
      .filter(Boolean)));
    if (names.length === 0) {
      toast({ title: 'Error', description: 'Enter one or more character names (comma or space separated)', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const existingLower = new Set(characters.map(c => c.name.toLowerCase()));
      const toAdd = names.filter(n => !existingLower.has(n.toLowerCase()));
      if (toAdd.length === 0) {
        toast({ title: 'No new characters', description: 'All provided names already exist in the roster', variant: 'destructive' });
        return;
      }
      const results = await Promise.allSettled(toAdd.map(n => fetchCharacterData(n)));
      const added: Character[] = [];
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          const d = res.value;
          added.push({
            id: (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
            ...d,
            lastUpdated: new Date().toISOString(),
          });
        }
      });
      if (added.length === 0) {
        toast({ title: 'Error', description: 'Failed to fetch data for provided names', variant: 'destructive' });
        return;
      }
      setCharacters(prev => [...prev, ...added]);
      setBulkNamesInput('');
      // Initialize dialog selections once
      const defaults: Record<string, boolean> = {};
      const parties: Record<string, number> = {};
      const selectedByBase: Record<string, string> = {};
      const enabledByBase: Record<string, boolean> = {};
      listAllBosses().forEach(b => { defaults[b.name] = b.defaultEnabled; parties[b.name] = 1; });
      ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
        data.forEach(([base, variants]) => {
          const key = makeGroupKey(cat, base);
          const preferred = variants.find(v => defaults[v.name]);
          const pick = preferred?.name || variants[0]?.name;
          if (pick) selectedByBase[key] = pick;
          enabledByBase[key] = preferred ? true : false;
        });
      });
      setSelectedBossEnabled(defaults);
      setPartySizes(parties);
      setSelectedVariantByBase(selectedByBase);
      setBaseEnabledByBase(enabledByBase);
      setPendingBulkNames(added.map(a => a.name));
      setPendingCharacterName(added[0].name);
      setIsBossDialogOpen(true);
      toast({ title: 'Characters Added', description: `Added ${added.length} character(s). Choose bosses once to apply to all.`, className: 'progress-complete' });
    } catch (e) {
      toast({ title: 'Error', description: 'Bulk add failed. Please verify names and try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const grouped = (() => {
    const m = new Map<string, Array<{ name: string; difficulty: string; mesos: number; imageUrl: string }>>();
    for (const b of allBosses) {
      const { difficulty, base } = parseBoss(b.name);
      if (!m.has(base)) m.set(base, []);
      m.get(base)!.push({ name: b.name, difficulty, mesos: b.mesos, imageUrl: b.imageUrl });
    }
    // Sort variants by typical difficulty order
    const order = new Map([['Easy', 0], ['Normal', 1], ['Chaos', 2], ['Hard', 3], ['Extreme', 4]]);
    for (const [k, arr] of m) {
      arr.sort((a, z) => (order.get(a.difficulty) ?? 99) - (order.get(z.difficulty) ?? 99));
    }
    return Array.from(m.entries()).sort((a, z) => a[0].localeCompare(z[0]));
  })();

  // Categorization for tabs
  const dailyVariants = new Set([
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
    'Normal Gollux'
  ]);
  const isMonthlyBase = (base: string) => base.includes('Black Mage');
  const sortByMesosDesc = (list: Array<[string, Array<{ name: string; difficulty: string; mesos: number; imageUrl: string }>]>) =>
    list.sort((a, z) => {
      const aMax = Math.max(...a[1].map(v => v.mesos));
      const zMax = Math.max(...z[1].map(v => v.mesos));
      return zMax - aMax;
    });
  // Build per-tab groups with variant-level filtering so bases can appear in multiple tabs
  const groupedDaily = sortByMesosDesc(
    grouped
      .map(([base, vars]) => [base, vars.filter(v => dailyVariants.has(v.name))] as [string, typeof vars])
      .filter(([_, vars]) => vars.length > 0)
  );
  const groupedWeekly = sortByMesosDesc(
    grouped
      .map(([base, vars]) => [base, vars.filter(v => !dailyVariants.has(v.name) && !isMonthlyBase(base))] as [string, typeof vars])
      .filter(([_, vars]) => vars.length > 0)
  );
  const groupedMonthly = sortByMesosDesc(
    grouped
      .map(([base, vars]) => [base, isMonthlyBase(base) ? vars : []] as [string, typeof vars])
      .filter(([_, vars]) => vars.length > 0)
  );
  const groupedAllForSave = [...groupedDaily, ...groupedWeekly, ...groupedMonthly];
  const [activeTab, setActiveTab] = useState<'monthly' | 'weekly' | 'daily'>('weekly');

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_roster', JSON.stringify(characters));
    } catch {
      // Ignore storage errors
    }
  }, [characters]);

  // Load stored EXP map to show level percentage like in BossTracker
  const [charExp, setCharExp] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('maplehub_char_exp');
      return stored ? (JSON.parse(stored) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const norm = (s: string) => s.normalize("NFKC").trim().toLowerCase();
  
    const target = searchParams.get("edit") ?? searchParams.get("editBosses");
    if (!target || characters.length === 0) return;
  
    const match = characters.find(c => norm(c.name) === norm(target));
    if (!match) return;
  
    openBossEditor(match.name); // open the dialog
  
    // clear only the edit params, and don't push a new history entry
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    next.delete("editBosses");
    setSearchParams(next, { replace: true });
  }, [searchParams, characters]); // <- depend on searchParams, not window/setter

  const getJobName = (jobID: number, jobDetail: number): string => {
    // Prefer specific class names by jobDetail when available
    const jobDetailMap: Record<number, Record<number, string>> = {
      // Thief branches (example provided)
      1: {
        12: 'Hero',
        22: 'Paladin',
        32: 'Dark Knight'
      },
      2: {
        12: 'Fire Poison (F/P)',
        22: 'Arch Mage (I/L)',
        32: 'Bishop'
      },
      3: {
        12: 'Bowmaster',
        22: 'Marksman',
        32: 'Pathfinder'
      },
      4: {
        12: 'Night Lord',
        22: 'Shadower',
        34: 'Dual Blade'
      },
      5: {
        12: 'Buccaneer',
        22: 'Corsair',
        32: 'Cannoneer'
      }
      // Add more detailed mappings here in the future as needed per jobID → jobDetail
    };

    const detailed = jobDetailMap[jobID]?.[jobDetail];
    if (detailed) return detailed;

    // Fallback to broad job family when detailed mapping is not known
    const jobMap: { [key: number]: string } = {
      1: 'Warrior',
      2: 'Magician', 
      3: 'Bowman',
      4: 'Thief',
      5: 'Pirate',
      11: 'Dawn Warrior',
      12: 'Blaze Wizard',
      13: 'Wind Archer',
      14: 'Night Walker',
      15: 'Thunder Breaker',
      21: 'Aran',
      22: 'Evan',
      23: 'Mercedes',
      24: 'Phantom',
      28: 'Kinesis',
      31: 'Demon Slayer',
      32: 'Battle Mage',
      33: 'Wild Hunter',
      35: 'Mechanic',
      202: 'Mihile',
      203: 'Luminous',
      204: 'Kaiser',
      205: 'Angelic Buster',
      206: 'Hayato',
      207: 'Kanna',
      208: 'Xenon',
      209: 'Demon Avenger',
      210: 'Zero',
      212: 'Shade',
      214: 'Kinesis',
      215: 'Blaster',
      216: 'Cadena',
      217: 'Illium',
      218: 'Ark',
      220: 'Hoyoung',
      221: 'Adele',
      222: 'Kain',
      223: 'Lara',
      224: 'Khali',
      225: 'Lynn',
      226: 'Mo Xuan',
      227: 'Sia Astelle'
    };
    return jobMap[jobID] || 'Unknown';
  };

  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;        // guard StrictMode double-run
    didRunRef.current = true;

    if (!characters.length || isLoading) return;

    const MIN_INTERVAL_MS = 15 * 60 * 1000; // at most every 15 min
    const STALE_MS = 6 * 60 * 60 * 1000;    // refresh if older than 6h

    const lastAuto = Number(localStorage.getItem("lastAutoRefreshAt") || 0);
    if (Date.now() - lastAuto < MIN_INTERVAL_MS) return;

    const isStale = characters.some(c => {
      const t = c.lastUpdated ? Date.parse(c.lastUpdated) : 0;
      return !t || Date.now() - t > STALE_MS;
    });

    if (isStale) {
      handleRefreshAll().finally(() => {
        localStorage.setItem("lastAutoRefreshAt", String(Date.now()));
      });
    }
  }, [characters, isLoading]);

  const openBossEditor = (characterName: string) => {
    try {
      setPendingCharacterName(characterName);
      // Load stored enables and party sizes
      const enabledKey = 'maplehub_boss_enabled';
      const partyKey = 'maplehub_boss_party';
      const enabledStored = localStorage.getItem(enabledKey);
      const partyStored = localStorage.getItem(partyKey);
      const enabledParsed = enabledStored ? (JSON.parse(enabledStored) as Record<string, Record<string, boolean>>) : {};
      const partyParsed = partyStored ? (JSON.parse(partyStored) as Record<string, Record<string, number>>) : {};
      const enabledForChar = enabledParsed[characterName] || {};
      const partyForChar = partyParsed[characterName] || {};

      const nextSelectedByBase: Record<string, string> = {};
      const nextBaseEnabledByBase: Record<string, boolean> = {};

      (['daily', 'weekly', 'monthly'] as const).forEach((cat) => {
        const data = cat === 'daily' ? groupedDaily : cat === 'weekly' ? groupedWeekly : groupedMonthly;
        data.forEach(([base, variants]) => {
          const gkey = makeGroupKey(cat, base);
          const firstEnabled = variants.find(v => enabledForChar[v.name]);
          const pick = (firstEnabled?.name) || variants[0]?.name || '';
          if (pick) nextSelectedByBase[gkey] = pick;
          nextBaseEnabledByBase[gkey] = !!firstEnabled;
        });
      });

      // Merge party sizes with defaults
      const nextPartySizes: Record<string, number> = {};
      listAllBosses().forEach(b => {
        const n = partyForChar[b.name];
        nextPartySizes[b.name] = Number.isFinite(n) ? Math.max(1, Math.min(6, Math.floor(n))) : 1;
      });

      setSelectedVariantByBase(nextSelectedByBase);
      setBaseEnabledByBase(nextBaseEnabledByBase);
      setPartySizes(nextPartySizes);
      setIsBossDialogOpen(true);
    } catch {
      // Fall back to defaults if anything goes wrong
      const defaults: Record<string, boolean> = {};
      const parties: Record<string, number> = {};
      const selectedByBase: Record<string, string> = {};
      const enabledByBase: Record<string, boolean> = {};
      listAllBosses().forEach(b => { defaults[b.name] = b.defaultEnabled; parties[b.name] = 1; });
      ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
        data.forEach(([base, variants]) => {
          const key = makeGroupKey(cat, base);
          const preferred = variants.find(v => defaults[v.name]);
          const pick = preferred?.name || variants[0]?.name;
          if (pick) selectedByBase[key] = pick;
          enabledByBase[key] = preferred ? true : false;
        });
      });
      setSelectedBossEnabled(defaults);
      setPartySizes(parties);
      setSelectedVariantByBase(selectedByBase);
      setBaseEnabledByBase(enabledByBase);
      setIsBossDialogOpen(true);
    }
  };

  const fetchCharacterData = async (characterName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('nexon-character-lookup', {
        body: { characterName }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch character data');
      }

      return {
        name: data.name,
        class: getJobName(data.jobID, data.jobDetail),
        level: data.level,
        reboot: true, // Using reboot_index=1 in API call
        avatarUrl: data.characterImgURL as string | undefined,
        exp: data.exp,
        isMain: data.isMain,
        legionLevel: data.legionLevel,
        raidPower: data.raidPower
      };
    } catch (error) {
      throw new Error('Failed to fetch character data from Nexon API');
    }
  };

  const handleAddCharacter = async () => {
    if (!newCharacterName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a character name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const existing = characters.some(c => c.name.toLowerCase() === newCharacterName.trim().toLowerCase());
      if (existing) {
        toast({ title: "Duplicate", description: "Character already in roster", variant: "destructive" });
        return;
      }

      const characterData = await fetchCharacterData(newCharacterName.trim());
      const newCharacter: Character = {
        id: Date.now().toString(),
        ...characterData,
        lastUpdated: new Date().toLocaleString()
      };
      
      setCharacters(prev => [...prev, newCharacter]);
      setNewCharacterName('');
      // Open boss selection dialog for this character
      setPendingCharacterName(characterData.name);
      const defaults: Record<string, boolean> = {};
      const parties: Record<string, number> = {};
      const selectedByBase: Record<string, string> = {};
      const enabledByBase: Record<string, boolean> = {};
      listAllBosses().forEach(b => { defaults[b.name] = b.defaultEnabled; parties[b.name] = 1; });
      // initialize per-category group keys
      ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
        data.forEach(([base, variants]) => {
          const key = makeGroupKey(cat, base);
          const preferred = variants.find(v => defaults[v.name]);
          const pick = preferred?.name || variants[0]?.name;
          if (pick) selectedByBase[key] = pick;
          enabledByBase[key] = preferred ? true : false;
        });
      });
      setSelectedBossEnabled(defaults);
      setPartySizes(parties);
      setSelectedVariantByBase(selectedByBase);
      setBaseEnabledByBase(enabledByBase);
      setIsBossDialogOpen(true);
      
      toast({
        title: "Character Added",
        description: `${characterData.name} has been added to your roster!`,
        className: "progress-complete"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch character data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [mainLegion, setMainLegion] = useState<number | null>(null);
  const [mainRaidPower, setMainRaidPower] = useState<number | null>(null);
  const [mainCharacter, setMainCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const main = characters.find(c => !!c.isMain) ?? null;
    setMainCharacter(main);
    setMainLegion(main?.legionLevel ?? null);
    setMainRaidPower(main?.raidPower ?? null);
  }, [characters]);
  
  const handleRefreshAll = async () => {
    setIsLoading(true);
    toast({
      title: "Refreshing Data",
      description: "Updating all character information...",
      className: "progress-partial",
    });
  
    try {
      const BATCH = 5; // adjust as needed
      const now = new Date().toISOString();
      const updated: Character[] = [];
      let failed = 0;
  
      for (let i = 0; i < characters.length; i += BATCH) {
        const batch = characters.slice(i, i + BATCH);
  
        const results = await Promise.allSettled(
          batch.map(async (char) => {
            const data = await fetchCharacterData(char.name);
            const isMain = data.isMain ?? char.isMain;
  
            return {
              ...char,
              name: data.name ?? char.name,
              class: data.class ?? char.class,
              level: data.level ?? char.level,
              reboot: char.reboot,
              avatarUrl: data.avatarUrl ?? char.avatarUrl,
              exp: data.exp ?? char.exp,
              lastUpdated: now,
  
              // fresh main/legion fields
              isMain,
              legionLevel:
                isMain === false ? null : (data.legionLevel ?? char.legionLevel ?? null),
              raidPower:
                isMain === false ? null : (data.raidPower ?? char.raidPower ?? null),
            } as Character;
          })
        );
  
        results.forEach((res, idx) => {
          if (res.status === "fulfilled") {
            updated.push(res.value);
          } else {
            failed++;
            updated.push({ ...batch[idx], lastUpdated: now });
          }
        });
      }
  
      setCharacters(updated);
  
      const main = updated.find((c) => c.isMain) ?? null;
      setMainCharacter(main);
      setMainLegion(main?.legionLevel ?? null);
      setMainRaidPower(main?.raidPower ?? null);
  
      toast({
        title: "Data Updated",
        description: failed
          ? `Updated ${updated.length - failed} character(s); ${failed} failed.`
          : "All character data has been refreshed!",
        className: failed ? "progress-warning" : "progress-complete",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moveCharacter = (index: number, direction: -1 | 1) => {
    setCharacters(prev => {
      const next = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(newIndex, 0, item);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Character Roster
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your Maplestory characters with live data from Nexon API
          </p>
        </div>
        <Button
          onClick={handleRefreshAll}
          disabled={isLoading}
          className="btn-accent w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add Character</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isLoading) handleBulkAdd();
            }}
            className="w-full flex gap-2"
          >
            <Input
              placeholder="Enter character name(s)"
              value={bulkNamesInput}
              onChange={(e) => setBulkNamesInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"                // <-- important
              disabled={isLoading}
              className="btn-hero w-full sm:w-auto"
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
          <p className="text-xs text-muted-foreground mt-1">
            Example: "Hikma, Mirae, Sancta, Ghost"
          </p>
        </CardContent>
      </Card>
      
      <Dialog open={isBossDialogOpen} onOpenChange={setIsBossDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {pendingBulkNames && pendingBulkNames.length > 1
                ? `Choose bosses for ${pendingBulkNames.length} characters`
                : `Choose bosses for ${pendingCharacterName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next: Record<string, boolean> = {};
                  allBosses.forEach(b => { next[b.name] = true; });
                  setSelectedBossEnabled(next);
                }}
              >Select All</Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next: Record<string, boolean> = {};
                  allBosses.forEach(b => { next[b.name] = false; });
                  setSelectedBossEnabled(next);
                }}
              >Deselect All</Button>
              <div className="ml-auto text-sm text-muted-foreground self-center">
                {Object.values(baseEnabledByBase).filter(Boolean).length} selected
              </div>
            </div>

            <ScrollArea className="h-[60vh] sm:h-[70vh] rounded border p-2" style={{ border: '0' }}>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-3 mb-3 w-full">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>

                </TabsList>
                {([['monthly', groupedMonthly], ['weekly', groupedWeekly], ['daily', groupedDaily]] as const).map(([key, data]) => (
                  <TabsContent key={key} value={key} className="m-0">
                    <div className="px-3">
                      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <div className="w-4" />
                        <div className="w-7" />
                        <div className="w-40">Boss</div>
                        <div className="flex-1">Difficulty</div>
                        <div className="w-24 text-right">Party Size</div>
                        <div className="w-40 text-right">Est. Mesos</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {data.map(([base, variants]) => (
                        <div key={base} className="rounded border p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={!!baseEnabledByBase[makeGroupKey(key, base)]}
                                onCheckedChange={() => setBaseEnabledByBase(prev => ({ ...prev, [makeGroupKey(key, base)]: !prev[makeGroupKey(key, base)] }))}
                              />
                              <img src={variants[0].imageUrl} alt={base} className="h-7 w-7 rounded-sm" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }} />
                              <div className="text-sm font-semibold text-primary flex-1 sm:w-40 truncate">{base}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {variants.map(v => {
                                const selected = (selectedVariantByBase[makeGroupKey(key, base)] || variants[0]?.name) === v.name;
                                return (
                                  <Button
                                    key={v.name}
                                    type="button"
                                    variant={selected ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedVariantByBase(prev => ({ ...prev, [makeGroupKey(key, base)]: v.name }))}
                                  >
                                    {v.difficulty}
                                  </Button>
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-1 text-xs sm:ml-auto">
                              {(() => {
                                const selName = selectedVariantByBase[makeGroupKey(key, base)] || variants[0]?.name || '';
                                return (
                                  <UiInput
                                    type="number"
                                    className="h-7 w-16"
                                    min={1}
                                    max={6}
                                    value={partySizes[selName] ?? 1}
                                    onChange={(e) => {
                                      const n = Math.max(1, Math.min(6, Number(e.target.value) || 1));
                                      setPartySizes(prev => ({ ...prev, [selName]: n }));
                                    }}
                                  />
                                );
                              })()}
                              <span>/6</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex-1 sm:w-40 text-right">
                              {(() => {
                                const selName = selectedVariantByBase[makeGroupKey(key, base)] || variants[0]?.name;
                                const variant = variants.find(v => v.name === selName) || variants[0];
                                const p = partySizes[variant?.name || ''] || 1;
                                const share = variant ? Math.floor(variant.mesos / Math.max(1, p)) : 0;
                                return `${share.toLocaleString()} mesos`;
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!pendingCharacterName) { setIsBossDialogOpen(false); return; }
                try {
                  const key = 'maplehub_boss_enabled';
                  const stored = localStorage.getItem(key);
                  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
                  const out: Record<string, boolean> = {};
                  ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
                    data.forEach(([base, variants]) => {
                      const gkey = makeGroupKey(cat, base);
                      const enabled = !!baseEnabledByBase[gkey];
                      const sel = selectedVariantByBase[gkey] || variants[0]?.name;
                      variants.forEach(v => { if (!(v.name in out)) out[v.name] = false; });
                      if (enabled && sel) out[sel] = true;
                    });
                  });
                  if (pendingBulkNames && pendingBulkNames.length > 0) {
                    pendingBulkNames.forEach(n => { parsed[n] = out; });
                  } else {
                    parsed[pendingCharacterName] = out;
                  }
                  localStorage.setItem(key, JSON.stringify(parsed));
                  const pkey = 'maplehub_boss_party';
                  const pstored = localStorage.getItem(pkey);
                  const pparsed = pstored ? (JSON.parse(pstored) as Record<string, Record<string, number>>) : {};
                  if (pendingBulkNames && pendingBulkNames.length > 0) {
                    pendingBulkNames.forEach(n => { pparsed[n] = { ...partySizes }; });
                  } else {
                    pparsed[pendingCharacterName] = { ...partySizes };
                  }
                  localStorage.setItem(pkey, JSON.stringify(pparsed));
                } catch {}
                setIsBossDialogOpen(false);
                setPendingCharacterName(null);
                setPendingBulkNames(null);
                toast({ title: 'Bosses Saved', description: 'Your boss selections were saved for this character.', className: 'progress-complete' });
              }}
              className="btn-hero"
            >Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card className="card-gaming">
        <CardHeader>
          {mainCharacter && ( 
            <div className='absolute right-10 '>
              <Button
                    variant="ghost"
                    size="sm"
                    title="Edit bosses"
                    onClick={() => openBossEditor(mainCharacter.name)}
                    className=""
                  >
                    <Pencil className="" />
                    Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    aria-label="Delete character"
                    title="Delete character"
                  >
                    <XIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {mainCharacter.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the character from your roster. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() =>
                        setCharacters(prev => prev.filter(c => c.id !== mainCharacter.id))
                      }
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div> 
            )
          } 
          <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <span>Main Character 
              
            </span>
          </CardTitle>
        </CardHeader>

        {mainCharacter ? (
          <CardContent className="flex items-center space-x-4">
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

              {/* Legion / RaidPower badges */}
              <div className="mt-2 flex space-x-2">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                  Legion: {mainLegion?.toLocaleString() ?? "N/A"}
                </span>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                  Raid Power: {mainRaidPower?.toLocaleString() ?? "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-sm text-gray-400">
            No main character detected.
            <p className='text-xs'>We auto-detect the main character as the highest-level on the account.</p>
          </CardContent>
        )}
      </Card>
      <Card className="card-gaming">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Mule Characters ({characters.length - (mainCharacter ? 1 : 0)})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Character Cards - Responsive Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {characters.map((character, idx) => (
              <>
              {!character.isMain && 
                <CharacterCard
                  key={character.id}
                  character={character}
                  variant="roster"
                  index={idx}
                  onMoveUp={() => moveCharacter(idx, -1)}
                  onMoveDown={() => moveCharacter(idx, 1)}
                  onEditBosses={() => openBossEditor(character.name)}
                  onRemove={() => setCharacters(prev => prev.filter(c => c.id !== character.id))}
                />
              }
              </>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-gaming border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-primary">Live Data Integration</h3>
            <p className="text-muted-foreground">
              Character data is now fetched live from Nexon's Maplestory Ranking API. 
              Add characters to see their current level and class information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Roster;