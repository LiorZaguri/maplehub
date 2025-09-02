import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Shield, Zap, Sword, Star, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';

interface VINode {
  name: string;
  level: number;
  maxLevel: number;
  exp: number;
  maxExp: number;
}

interface WeaponData {
  name: string;
  starforce: number;
  potential: string;
  bonus: string;
  flame: string;
}

const VITracker = () => {
  const [characterData] = useState({
    name: 'SampleHero',
    class: 'Hero',
    level: 275,
    viNodes: [
      { name: 'Brandish: Reinforce', level: 25, maxLevel: 25, exp: 0, maxExp: 0 },
      { name: 'Brandish: Extra Strike', level: 23, maxLevel: 25, exp: 1250, maxExp: 2500 },
      { name: 'Brandish: Boss Rush', level: 20, maxLevel: 25, exp: 800, maxExp: 2000 },
      { name: 'Final Attack: Reinforce', level: 25, maxLevel: 25, exp: 0, maxExp: 0 },
      { name: 'Shout: Reinforce', level: 18, maxLevel: 25, exp: 400, maxExp: 1800 },
      { name: 'Combo Fury: Boss Rush', level: 15, maxLevel: 25, exp: 200, maxExp: 1500 }
    ] as VINode[],
    weapon: {
      name: 'Arcane Umbra Sword',
      starforce: 22,
      potential: 'Legendary (ATT +40%)',
      bonus: 'Unique (Boss +35%)',
      flame: 'T7 (ATT +120)'
    } as WeaponData
  });

  const getTotalNodeLevels = () => {
    return characterData.viNodes.reduce((sum, node) => sum + node.level, 0);
  };

  const getMaxPossibleLevels = () => {
    return characterData.viNodes.reduce((sum, node) => sum + node.maxLevel, 0);
  };

  const getNodeProgress = (node: VINode) => {
    if (node.level === node.maxLevel) return 100;
    return (node.exp / node.maxExp) * 100;
  };

  const getNodeLevelColor = (level: number, maxLevel: number) => {
    const percentage = (level / maxLevel) * 100;
    if (percentage === 100) return 'progress-complete';
    if (percentage >= 80) return 'progress-partial';
    return 'progress-incomplete';
  };

  const getStarforceColor = (starforce: number) => {
    if (starforce >= 22) return 'progress-complete';
    if (starforce >= 17) return 'progress-partial';
    return 'progress-incomplete';
  };

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            VI (5th Job) Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track 5th job node progress and weapon enhancement for Heroic class
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary">{characterData.name}</Badge>
            <Badge className="level-badge">Level {characterData.level}</Badge>
            <Badge variant="outline">{characterData.class}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{characterData.viNodes.length}</p>
                <p className="text-sm text-muted-foreground">Active Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{getTotalNodeLevels()}/{getMaxPossibleLevels()}</p>
                <p className="text-sm text-muted-foreground">Total Node Levels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Sword className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{characterData.weapon.starforce}★</p>
                <p className="text-sm text-muted-foreground">Starforce Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((getTotalNodeLevels() / getMaxPossibleLevels()) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Node Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>5th Job Nodes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {characterData.viNodes.map((node, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-primary">
                    {node.name}
                  </TableCell>
                  <TableCell>
                    <Badge className={getNodeLevelColor(node.level, node.maxLevel)}>
                      {node.level}/{node.maxLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {node.level === node.maxLevel ? 'MAX' : `${node.exp}/${node.maxExp}`}
                  </TableCell>
                  <TableCell className="w-32">
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={getNodeProgress(node)} 
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {Math.round(getNodeProgress(node))}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sword className="h-5 w-5 text-primary" />
            <span>Weapon Enhancement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <h3 className="font-semibold text-lg text-primary">{characterData.weapon.name}</h3>
                <p className="text-muted-foreground">Primary Weapon</p>
              </div>
              <Badge className={getStarforceColor(characterData.weapon.starforce)}>
                {characterData.weapon.starforce} Stars
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="card-glow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Potential</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-primary">{characterData.weapon.potential}</p>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Bonus Potential</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-secondary">{characterData.weapon.bonus}</p>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Flame</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-accent">{characterData.weapon.flame}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gaming border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-primary">Node EXP Calculator</h3>
            <p className="text-muted-foreground">
              Enhanced node tracking with EXP calculations and optimization suggestions 
              will be available with backend integration.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default VITracker;