import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, User, Target } from 'lucide-react';
import { FragmentCharacter, HEXASkill, SkillType } from '../types';
import { ProgressSummaryCard } from './ProgressSummaryCard';
import { NextUpgradeCard } from './NextUpgradeCard';
import { SkillRow } from './SkillRow';
import { FragmentRateCalculator } from './FragmentRateCalculator';
import { getTotalCost } from '../utils/costTables';
import { getSkillsByPriority, calculateClassBasedPriority } from '../utils/hexaPriority';
import { getClassLevelingOrder, decompressLevelingOrder } from '../utils/classLevelingOrders';
import { CUSTOM_CLASS_LEVELING_ORDER } from '../constants/customClassOrder';

interface CharacterDetailScreenProps {
  character: FragmentCharacter;
  onSkillUpdate: (characterId: string, skillId: string, updates: Partial<HEXASkill>) => void;
  onAddSkill: () => void;
  isLoading?: boolean;
}

export const CharacterDetailScreen = ({
  character,
  onSkillUpdate,
  onAddSkill,
  isLoading = false
}: CharacterDetailScreenProps) => {

  // Calculate totals (matching working calculator logic)
  const totals = useMemo(() => {
    // Filter out disabled skills (Ascent) from fragment calculations
    const activeSkills = character.hexaSkills.filter(skill => !skill.id.includes('-skill-10')); // Ascent is always the 10th skill
    
    const totalFragments = activeSkills.reduce((sum, skill) => {
      if (skill.targetLevel > skill.currentLevel) {
        const cost = getTotalCost(skill.skillType, skill.currentLevel, skill.targetLevel);
        return sum + cost.fragments;
      }
      return sum;
    }, 0);

    const totalSolErda = activeSkills.reduce((sum, skill) => {
      if (skill.targetLevel > skill.currentLevel) {
        const cost = getTotalCost(skill.skillType, skill.currentLevel, skill.targetLevel);
        return sum + cost.solErda;
      }
      return sum;
    }, 0);

    return { totalFragments, totalSolErda };
  }, [character.hexaSkills]);

  // Find next upgrade priority using class-specific leveling order
  const { nextUpgrade, upcomingSkills } = useMemo(() => {
    const prioritySkills = getSkillsByPriority(character.hexaSkills, character.jobName);
    if (!prioritySkills || prioritySkills.length === 0) {
      return { nextUpgrade: null, upcomingSkills: [] };
    }
    
    const prioritySkill = prioritySkills[0]; // Get the highest priority skill
    const nextLevel = prioritySkill.nextOptimalLevel || (prioritySkill.skill.currentLevel + 1);
    
    // Add calculated costs for the immediate next level only (current + 1)
    const nextUpgrade = {
      ...prioritySkill.skill,
      targetLevel: nextLevel, // Use the optimal level from class order
      costs: getTotalCost(prioritySkill.skill.skillType, prioritySkill.skill.currentLevel, prioritySkill.skill.currentLevel + 1)
    };

    // Get the class leveling order from the array
    const classData = CUSTOM_CLASS_LEVELING_ORDER.find(item => item.class === character.jobName);
    if (!classData) {
      return { nextUpgrade, upcomingSkills: [] };
    }

    // Helper function to get skill position from skill ID
    const getSkillPositionFromId = (skillId: string): number => {
      const separatedMatch = skillId.match(/-separated-skill-(\d+)$/);
      if (separatedMatch) {
        return 10 + parseInt(separatedMatch[1]);
      }
      const mainMatch = skillId.match(/-skill-(\d+)$/);
      if (mainMatch) {
        return parseInt(mainMatch[1]);
      }
      return 0;
    };

    // Find current position in the class order
    const currentLevels = new Map();
    character.hexaSkills.forEach(skill => {
      const skillPosition = getSkillPositionFromId(skill.id);
      currentLevels.set(skillPosition, skill.currentLevel);
    });

    // Find where we are in the class order by tracking completed steps
    let currentIndex = 0;
    const completedSteps = new Map(); // Track how many levels we've completed for each skill
    
    for (let i = 0; i < classData.order.length; i++) {
      const [skillPosition, targetLevel] = classData.order[i];
      const currentLevel = currentLevels.get(skillPosition) || 0;
      const completedForThisSkill = completedSteps.get(skillPosition) || 0;
      
      // If we haven't completed this step yet
      if (currentLevel <= completedForThisSkill) {
        currentIndex = i;
        break;
      } else {
        // Mark this step as completed
        completedSteps.set(skillPosition, Math.max(completedForThisSkill, targetLevel));
        currentIndex = i + 1; // Move to next step
      }
    }

    // Get all remaining items from the class order
    const remainingItems = classData.order.slice(currentIndex);
    
    console.log('Debug - Current index:', currentIndex);
    console.log('Debug - Remaining items:', remainingItems.length);
    console.log('Debug - Current levels:', Array.from(currentLevels.entries()));
    
    // Group consecutive skills of the same type
    const groupedItems = [];
    let currentGroup = null;
    
    for (const [skillPosition, targetLevel] of remainingItems) {
      if (currentGroup && currentGroup.skillPosition === skillPosition) {
        // Same skill as previous, update the target level
        currentGroup.targetLevel = targetLevel;
      } else {
        // Different skill, start a new group
        if (currentGroup) {
          groupedItems.push(currentGroup);
        }
        currentGroup = { skillPosition, targetLevel };
      }
    }
    
    // Don't forget the last group
    if (currentGroup) {
      groupedItems.push(currentGroup);
    }
    
    // Convert to PriorityScore objects, but only include skills that need upgrading
    const upcomingSkills = groupedItems.map(({ skillPosition, targetLevel }) => {
      const skill = character.hexaSkills.find(s => getSkillPositionFromId(s.id) === skillPosition);
      if (skill) {
        // Only include if the skill's current level is less than its target level
        if (skill.currentLevel < targetLevel) {
          const priority = calculateClassBasedPriority(skill, character.jobName);
          priority.nextOptimalLevel = targetLevel;
          return priority;
        }
      }
      return null;
    }).filter(Boolean);

    return { nextUpgrade, upcomingSkills };
  }, [character.hexaSkills, character.jobName]);


  const handleSkillLevelChange = (skillId: string, level: number, type: 'current' | 'target') => {
    const skill = character.hexaSkills.find(s => s.id === skillId);
    if (!skill) return;

    const updates: Partial<HEXASkill> = {};
    if (type === 'current') {
      updates.currentLevel = level;
      updates.isComplete = level >= skill.targetLevel;
    } else {
      updates.targetLevel = level;
      updates.isComplete = skill.currentLevel >= level;
    }

    onSkillUpdate(character.id, skillId, updates);
  };



  if (!character) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No character selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEXA Progression Summary - Top Bar */}
      <ProgressSummaryCard
        fragmentsSpent={character.progression.fragmentsSpent}
        fragmentsTotal={character.progression.fragmentsTotal}
        solErdaSpent={character.progression.solErdaSpent}
        solErdaTotal={character.progression.solErdaTotal}
        isLoading={isLoading}
      />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Configuration - Left Side */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skills Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {character.hexaSkills.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No skills configured yet</p>
                  <Button onClick={onAddSkill} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Skill
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main 10 Skills */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Main HEXA Skills</h3>
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
                      {character.hexaSkills.slice(0, 10).map((skill) => (
                        <SkillRow
                          key={skill.id}
                          skill={skill}
                          onCurrentLevelChange={(level) => handleSkillLevelChange(skill.id, level, 'current')}
                          onTargetLevelChange={(level) => handleSkillLevelChange(skill.id, level, 'target')}
                          isDisabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Separated Skills */}
                  {character.hexaSkills.length > 10 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">Additional Skills</h3>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {character.hexaSkills.slice(10).map((skill) => (
                          <SkillRow
                            key={skill.id}
                            skill={skill}
                            onCurrentLevelChange={(level) => handleSkillLevelChange(skill.id, level, 'current')}
                            onTargetLevelChange={(level) => handleSkillLevelChange(skill.id, level, 'target')}
                            isDisabled={isLoading}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - HEXA Upgrade Priority and Fragment Rate Calculator */}
        <div className="space-y-6">
          {/* HEXA Upgrade Priority */}
          <NextUpgradeCard
            nextUpgrade={nextUpgrade}
            upcomingSkills={upcomingSkills}
            onSetTarget={() => {
              if (nextUpgrade) {
                onSkillUpdate(character.id, nextUpgrade.id, { 
                  currentLevel: nextUpgrade.currentLevel + 1,
                  isComplete: (nextUpgrade.currentLevel + 1) >= nextUpgrade.targetLevel
                });
              }
            }}
            isLoading={isLoading}
          />

          {/* Fragment Rate Calculator */}
          <FragmentRateCalculator
            totalFragments={totals.totalFragments}
            estimatedDays={character.estimatedCompletionDays}
          />
        </div>
      </div>
    </div>
  );
};
