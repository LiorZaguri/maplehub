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
import { getSkillsByPriority } from '../utils/hexaPriority';

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
  const nextUpgrade = useMemo(() => {
    const prioritySkills = getSkillsByPriority(character.hexaSkills, character.jobName);
    if (!prioritySkills || prioritySkills.length === 0) {
      return null;
    }
    
    const prioritySkill = prioritySkills[0]; // Get the highest priority skill
    const nextLevel = prioritySkill.nextOptimalLevel || (prioritySkill.skill.currentLevel + 1);
    
    // Add calculated costs for the immediate next level only (current + 1)
    return {
      ...prioritySkill.skill,
      targetLevel: nextLevel, // Use the optimal level from class order
      costs: getTotalCost(prioritySkill.skill.skillType, prioritySkill.skill.currentLevel, prioritySkill.skill.currentLevel + 1)
    };
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
