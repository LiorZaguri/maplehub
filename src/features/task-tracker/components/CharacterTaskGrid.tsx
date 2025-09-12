import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Star, Clock, Calendar, Edit3, MoreHorizontal, Sparkles } from 'lucide-react';
import { Character } from '@/hooks/useCharacterData';
import { Task } from '@/hooks/useTaskManagement';
import { useTimeCalculations } from '@/hooks/useTimeCalculations';
import { getLevelProgress } from '@/lib/levels';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CharacterTaskGridProps {
  characters: Character[];
  tasks: Task[];
  hiddenCharacters: Set<string>;
  expandedTaskLists: Set<string>;
  onToggleTask: (taskId: string) => void;
  onToggleCharacterVisibility: (characterName: string) => void;
  onToggleTaskListExpansion: (characterName: string) => void;
  onOpenTaskSelector: (characterName: string) => void;
  onToggleAllTasks: (characterName: string, checkAll: boolean) => void;
  onToggleSectionCollapse: (characterName: string, section: 'daily' | 'weekly' | 'monthly') => void;
  isSectionCollapsed: (characterName: string, section: 'daily' | 'weekly' | 'monthly') => boolean;
}

const CharacterTaskGrid: React.FC<CharacterTaskGridProps> = ({
  characters,
  tasks,
  hiddenCharacters,
  expandedTaskLists,
  onToggleTask,
  onToggleCharacterVisibility,
  onToggleTaskListExpansion,
  onOpenTaskSelector,
  onToggleAllTasks,
  onToggleSectionCollapse,
  isSectionCollapsed,
}) => {
  const { formatTimeRemaining, getTimeUntilReset, isUrsusGoldenTime } = useTimeCalculations();

  const getCharacterTasks = (characterName: string, frequency?: 'daily' | 'weekly' | 'monthly') => {
    return tasks.filter(task =>
      task.character === characterName &&
      (!frequency || task.frequency === frequency)
    );
  };

  const getCharacterByName = (name: string) => {
    return characters.find(char => char.name === name);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 border-red-200 bg-red-50';
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'low': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 custom-1920:grid-cols-5">
      {characters.map((character) => {
        const dailyTasks = getCharacterTasks(character.name, 'daily');
        const weeklyTasks = getCharacterTasks(character.name, 'weekly');
        const monthlyTasks = getCharacterTasks(character.name, 'monthly');
        const allTasks = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];
        const completedTasks = allTasks.filter(task => task.completed).length;

        const isHidden = hiddenCharacters.has(character.name);

        return (
          <Card
            key={character.id}
            className={`card-gaming ${isHidden ? 'opacity-60' : ''}`}
          >
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={character.avatarUrl || '/placeholder.svg'}
                    alt={character.name}
                    className={`w-24 h-24 object-cover rounded ${isHidden ? 'grayscale' : ''}`}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.src = '/placeholder.svg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold truncate text-base ${isHidden ? 'text-muted-foreground' : 'text-primary'}`}>
                        {character.name}
                      </h3>
                      {character.isMain && <Star className={`h-3 w-3 flex-shrink-0 ${isHidden ? 'text-muted-foreground' : 'text-amber-400'}`} />}
                    </div>
                    <p className={`text-sm ${isHidden ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                      Lv. {character.level} • {character.class}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="More options"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onToggleCharacterVisibility(character.name)}>
                        {isHidden ? (
                          <>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Show character
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                            Hide character
                          </>
                        )}
                      </DropdownMenuItem>
                      {(!isHidden) && (
                        <DropdownMenuItem onClick={() => onOpenTaskSelector(character.name)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit tasks
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

            </CardHeader>
            {!isHidden && (
              <CardContent className={`pt-0 ${expandedTaskLists.has(character.name) ? 'max-h-none' : 'max-h-96 overflow-y-auto scrollbar-hide'}`}>
                {allTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks for this character
                  </p>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {completedTasks}/{allTasks.length}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0}% done
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onToggleTaskListExpansion(character.name)}
                        title={expandedTaskLists.has(character.name) ? 'Collapse task list' : 'Expand task list'}
                      >
                        {expandedTaskLists.has(character.name) ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-4">
                  {/* Daily Tasks */}
                  {dailyTasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onToggleSectionCollapse(character.name, 'daily')}
                          >
                            {isSectionCollapsed(character.name, 'daily') ? (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </Button>
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">Daily</span>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">
                            {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {dailyTasks.length > 0 ? Math.round((dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100) : 0}%
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeRemaining(getTimeUntilReset.daily, 'daily')}
                        </span>
                      </div>
                      <div className={`grid grid-cols-1 gap-1 transition-all duration-300 ease-in-out ${
                        isSectionCollapsed(character.name, 'daily')
                          ? 'max-h-0 opacity-0 overflow-hidden'
                          : expandedTaskLists.has(character.name)
                            ? 'max-h-none opacity-100'
                            : 'max-h-80 opacity-100 overflow-y-auto scrollbar-hide'
                      }`}>
                        {dailyTasks.map((task) => {
                          const isUrsusTask = task.name.toLowerCase().includes('ursus');
                          const isGoldenTimeActive = isUrsusGoldenTime;

                          return (
                            <div
                              key={task.id}
                              className={`flex items-center gap-2 p-2 rounded-md border transition-all duration-200 cursor-pointer ${
                                task.completed
                                  ? 'bg-muted/20 border-muted/50 opacity-60'
                                  : isUrsusTask && isGoldenTimeActive
                                    ? 'bg-gradient-to-r from-yellow-50/80 to-orange-50/80 border-yellow-300/60 shadow-sm'
                                    : 'bg-card/50 border-border/60 hover:bg-card hover:border-border'
                              }`}
                              onClick={() => onToggleTask(task.id)}
                            >
                              <div className="flex-shrink-0">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => onToggleTask(task.id)}
                                  className={`h-3.5 w-3.5 ${
                                    isUrsusTask && isGoldenTimeActive && !task.completed
                                      ? 'data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 border-yellow-400'
                                      : 'data-[state=checked]:bg-success data-[state=checked]:border-success'
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <span className={`text-xs font-medium truncate ${
                                    task.completed
                                      ? 'line-through text-muted-foreground'
                                      : isUrsusTask && isGoldenTimeActive
                                        ? 'text-yellow-700 font-semibold'
                                        : 'text-foreground'
                                  }`}>
                                    {task.name}
                                  </span>
                                  {isUrsusTask && isGoldenTimeActive && !task.completed && (
                                    <span className="text-yellow-600 text-xs font-bold animate-pulse flex-shrink-0">
                                      ⚡
                                    </span>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5 h-4 flex-shrink-0 bg-gray-50 text-gray-700 border-gray-200"
                                >
                                  {task.category.replace('Dailies', '').replace('Symbol ', '').replace('Daily ', '').trim()}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Weekly Tasks */}
                  {weeklyTasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onToggleSectionCollapse(character.name, 'weekly')}
                          >
                            {isSectionCollapsed(character.name, 'weekly') ? (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </Button>
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">Weekly</span>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">
                            {weeklyTasks.filter(t => t.completed).length}/{weeklyTasks.length}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {weeklyTasks.length > 0 ? Math.round((weeklyTasks.filter(t => t.completed).length / weeklyTasks.length) * 100) : 0}%
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeRemaining(getTimeUntilReset.weekly, 'weekly')}
                        </span>
                      </div>
                      <div className={`grid grid-cols-1 gap-1 transition-all duration-300 ease-in-out ${
                        isSectionCollapsed(character.name, 'weekly')
                          ? 'max-h-0 opacity-0 overflow-hidden'
                          : expandedTaskLists.has(character.name)
                            ? 'max-h-none opacity-100'
                            : 'max-h-80 opacity-100 overflow-y-auto scrollbar-hide'
                      }`}>
                        {weeklyTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center gap-2 p-2 rounded-md border transition-all duration-200 cursor-pointer ${
                              task.completed
                                ? 'bg-muted/20 border-muted/50 opacity-60'
                                : 'bg-card/50 border-border/60 hover:bg-card hover:border-border'
                            }`}
                            onClick={() => onToggleTask(task.id)}
                          >
                            <div className="flex-shrink-0">
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => onToggleTask(task.id)}
                                className="data-[state=checked]:bg-success data-[state=checked]:border-success h-3.5 w-3.5"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                              <span className={`text-xs font-medium truncate ${
                                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}>
                                {task.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0.5 h-4 flex-shrink-0 bg-gray-50 text-gray-700 border-gray-200"
                              >
                                {task.category.replace('Weeklies', '').replace('Weekly ', '').replace('Symbol ', '').trim()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Tasks */}
                  {monthlyTasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onToggleSectionCollapse(character.name, 'monthly')}
                          >
                            {isSectionCollapsed(character.name, 'monthly') ? (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </Button>
                          <Star className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">Monthly</span>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">
                            {monthlyTasks.filter(t => t.completed).length}/{monthlyTasks.length}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeRemaining(getTimeUntilReset.monthly, 'monthly')}
                        </span>
                      </div>
                      <div className={`grid grid-cols-1 gap-1 transition-all duration-300 ease-in-out ${
                        isSectionCollapsed(character.name, 'monthly')
                          ? 'max-h-0 opacity-0 overflow-hidden'
                          : expandedTaskLists.has(character.name)
                            ? 'max-h-none opacity-100'
                            : 'max-h-80 opacity-100 overflow-y-auto scrollbar-hide'
                      }`}>
                        {monthlyTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center gap-2 p-2 rounded-md border transition-all duration-200 cursor-pointer ${
                              task.completed
                                ? 'bg-muted/20 border-muted/50 opacity-60'
                                : 'bg-card/50 border-border/60 hover:bg-card hover:border-border'
                            }`}
                            onClick={() => onToggleTask(task.id)}
                          >
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleTask(task.id);
                              }}
                              className="flex-shrink-0"
                            >
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => {}}
                                className="data-[state=checked]:bg-success data-[state=checked]:border-success h-3.5 w-3.5"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                              <span className={`text-xs font-medium truncate ${
                                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}>
                                {task.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0.5 h-4 flex-shrink-0 bg-gray-50 text-gray-700 border-gray-200"
                              >
                                {task.category.replace('Monthly ', '').trim()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                    </div>
                  </>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default CharacterTaskGrid;
