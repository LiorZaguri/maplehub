import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CheckSquare, Plus, Calendar, Target, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Task {
  id: string;
  name: string;
  character: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  category: string;
  dueDate: string;
}

const TaskTracker = () => {
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Daily Ursus',
      character: 'SampleHero',
      frequency: 'daily',
      completed: false,
      category: 'Daily Quest',
      dueDate: '2024-01-16'
    },
    {
      id: '2',
      name: 'Maple Tour',
      character: 'SampleHero',
      frequency: 'daily',
      completed: true,
      category: 'Daily Quest',
      dueDate: '2024-01-16'
    },
    {
      id: '3',
      name: 'Weekly Mu Lung Dojo',
      character: 'SampleHero',
      frequency: 'weekly',
      completed: false,
      category: 'Weekly Quest',
      dueDate: '2024-01-21'
    }
  ]);

  const [newTask, setNewTask] = useState({
    name: '',
    character: 'SampleHero',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    category: 'Daily Quest'
  });

  const taskCategories = [
    'Daily Quest', 'Weekly Quest', 'Event', 'Grinding', 'Collection', 'Other'
  ];

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? "Task Unmarked" : "Task Completed",
        description: `${task.name} for ${task.character}`,
        className: task.completed ? "progress-incomplete" : "progress-complete"
      });
    }
  };

  const addTask = () => {
    if (!newTask.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task name",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ ...newTask, name: '' });
    
    toast({
      title: "Task Added",
      description: `${task.name} added for ${task.character}`,
      className: "progress-complete"
    });
  };

  const resetTasks = (frequency: 'daily' | 'weekly' | 'monthly') => {
    setTasks(prev => prev.map(task => 
      task.frequency === frequency ? { ...task, completed: false } : task
    ));
    
    toast({
      title: `${frequency} Reset`,
      description: `All ${frequency} tasks have been reset!`,
      className: "progress-complete"
    });
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const dailyCompleted = tasks.filter(task => task.frequency === 'daily' && task.completed).length;
    const dailyTotal = tasks.filter(task => task.frequency === 'daily').length;
    
    return { total, completed, dailyCompleted, dailyTotal };
  };

  const stats = getTaskStats();

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'progress-complete';
      case 'weekly': return 'progress-partial';
      case 'monthly': return 'progress-incomplete';
      default: return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Task Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage daily, weekly, and monthly tasks for all characters
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => resetTasks('daily')}
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-primary w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Daily
          </Button>
          <Button
            onClick={() => resetTasks('weekly')}
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-primary w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Weekly
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}/{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.dailyCompleted}/{stats.dailyTotal}</p>
                <p className="text-sm text-muted-foreground">Daily Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((stats.completed / stats.total) * 100) || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Days Until Reset</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add New Task</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Task name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <Input
              placeholder="Character name"
              value={newTask.character}
              onChange={(e) => setNewTask({ ...newTask, character: e.target.value })}
            />
            <Select 
              value={newTask.frequency} 
              onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                setNewTask({ ...newTask, frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={newTask.category} 
              onValueChange={(value: string) => setNewTask({ ...newTask, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addTask} className="btn-hero">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span>Task List ({tasks.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Done</TableHead>
                <TableHead>Task Name</TableHead>
                <TableHead>Character</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className={`hover:bg-muted/50 ${task.completed ? 'opacity-60' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskComplete(task.id)}
                      className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                    {task.name}
                  </TableCell>
                  <TableCell>{task.character}</TableCell>
                  <TableCell>
                    <Badge className={getFrequencyBadgeColor(task.frequency)}>
                      {task.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.dueDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default TaskTracker;