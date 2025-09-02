import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserCheck, Coins, Plus, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Mule {
  id: string;
  name: string;
  class: string;
  level: number;
  purpose: string;
  dailyMesos: number;
  weeklyMesos: number;
  lastPlayed: string;
  server: 'Reboot' | 'Regular';
}

const Mules = () => {
  const { toast } = useToast();
  
  const [mules, setMules] = useState<Mule[]>([
    {
      id: '1',
      name: 'MesoMule1',
      class: 'Kanna',
      level: 200,
      purpose: 'Meso Farming',
      dailyMesos: 500000000,
      weeklyMesos: 3500000000,
      lastPlayed: '2024-01-15',
      server: 'Reboot'
    },
    {
      id: '2',
      name: 'BossMule',
      class: 'Bishop',
      level: 210,
      purpose: 'Weekly Bosses',
      dailyMesos: 150000000,
      weeklyMesos: 2800000000,
      lastPlayed: '2024-01-14',
      server: 'Reboot'
    },
    {
      id: '3',
      name: 'LinkMule',
      class: 'Demon Avenger',
      level: 120,
      purpose: 'Link Skill',
      dailyMesos: 0,
      weeklyMesos: 0,
      lastPlayed: '2024-01-10',
      server: 'Reboot'
    }
  ]);

  const [newMule, setNewMule] = useState({
    name: '',
    class: '',
    level: 1,
    purpose: 'Meso Farming',
    server: 'Reboot' as 'Reboot' | 'Regular'
  });

  const mulePurposes = [
    'Meso Farming', 'Weekly Bosses', 'Link Skill', 'Legion', 'Storage', 'Other'
  ];

  const formatMesos = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}M`;
    }
    return amount.toLocaleString();
  };

  const getTotalMesos = (type: 'daily' | 'weekly') => {
    return mules.reduce((sum, mule) => 
      sum + (type === 'daily' ? mule.dailyMesos : mule.weeklyMesos), 0
    );
  };

  const getPurposeBadgeColor = (purpose: string) => {
    switch (purpose) {
      case 'Meso Farming': return 'progress-complete';
      case 'Weekly Bosses': return 'progress-partial';
      case 'Link Skill': return 'progress-incomplete';
      default: return 'secondary';
    }
  };

  const addMule = () => {
    if (!newMule.name.trim() || !newMule.class.trim()) {
      toast({
        title: "Error",
        description: "Please enter both character name and class",
        variant: "destructive"
      });
      return;
    }

    const mule: Mule = {
      id: Date.now().toString(),
      ...newMule,
      dailyMesos: 0,
      weeklyMesos: 0,
      lastPlayed: new Date().toISOString().split('T')[0]
    };

    setMules(prev => [...prev, mule]);
    setNewMule({ ...newMule, name: '', class: '' });
    
    toast({
      title: "Mule Added",
      description: `${mule.name} (${mule.class}) has been added to your mules!`,
      className: "progress-complete"
    });
  };

  const getAverageMuleLevel = () => {
    if (mules.length === 0) return 0;
    return Math.round(mules.reduce((sum, mule) => sum + mule.level, 0) / mules.length);
  };

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mules Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track secondary characters for meso farming, bosses, and link skills
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{mules.length}</p>
                <p className="text-sm text-muted-foreground">Total Mules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{formatMesos(getTotalMesos('daily'))}</p>
                <p className="text-sm text-muted-foreground">Daily Mesos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{formatMesos(getTotalMesos('weekly'))}</p>
                <p className="text-sm text-muted-foreground">Weekly Mesos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{getAverageMuleLevel()}</p>
                <p className="text-sm text-muted-foreground">Average Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add New Mule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Input
              placeholder="Character name"
              value={newMule.name}
              onChange={(e) => setNewMule({ ...newMule, name: e.target.value })}
            />
            <Input
              placeholder="Class"
              value={newMule.class}
              onChange={(e) => setNewMule({ ...newMule, class: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Level"
              value={newMule.level}
              onChange={(e) => setNewMule({ ...newMule, level: parseInt(e.target.value) || 1 })}
            />
            <Select 
              value={newMule.purpose} 
              onValueChange={(value: string) => setNewMule({ ...newMule, purpose: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mulePurposes.map(purpose => (
                  <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={newMule.server} 
              onValueChange={(value: 'Reboot' | 'Regular') => setNewMule({ ...newMule, server: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reboot">Reboot</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addMule} className="btn-hero">
              <Plus className="h-4 w-4 mr-2" />
              Add Mule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>Mule List ({mules.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Character Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Daily Mesos</TableHead>
                <TableHead>Weekly Mesos</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Last Played</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mules.map((mule) => (
                <TableRow key={mule.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-primary">
                    {mule.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{mule.class}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="level-badge">{mule.level}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPurposeBadgeColor(mule.purpose)}>
                      {mule.purpose}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-accent">
                    {formatMesos(mule.dailyMesos)}
                  </TableCell>
                  <TableCell className="font-mono text-success">
                    {formatMesos(mule.weeklyMesos)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={mule.server === 'Reboot' ? "default" : "outline"}>
                      {mule.server}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mule.lastPlayed}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="card-gaming border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-primary">Meso Tracking & Analytics</h3>
            <p className="text-muted-foreground">
              Advanced meso tracking, farming efficiency calculations, and automated 
              progress updates will be available with backend integration.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default Mules;