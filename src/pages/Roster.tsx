import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  AddCharacterForm,
  BossEditorDialog,
  CharacterGrid,
  ExpGraphCard,
  MainCharacterCard,
  useRoster
} from '@/features/roster';

const Roster = () => {
  const navigate = useNavigate();
  
  const {
    // State
    characters,
    mainCharacter,
    mainLegion,
    mainRaidPower,
    selectedExpCharacter,
    expChartTimePeriod,
    bulkNamesInput,
    isLoading,
    isDataRefreshing,
    characterRegion,
    isBossDialogOpen,
    pendingCharacterName,
    pendingBulkNames,

    // Actions
    setBulkNamesInput,
    setCharacterRegion,
    setExpChartTimePeriod,
    setIsBossDialogOpen,
    setPendingCharacterName,

    // Functions
    removeCharacter,
    moveCharacter,
    setCharacterAsMain,
    refreshAllCharacters,
    handleBulkAdd,
    selectCharacterForExpGraph,
    addCharacter,
  } = useRoster();

  const handleEditBosses = (characterName: string) => {
    setPendingCharacterName(characterName);
    // Clear bulk names when opening single character editor
    // This will be handled by useRoster hook
    setIsBossDialogOpen(true);
  };


  const handleToast = (options: { title: string; description: string; variant?: string }) => {
    // This will be handled by the useToast hook in useRoster
    console.log('Toast:', options);
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
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
          onClick={refreshAllCharacters}
          disabled={isLoading}
          className="btn-accent w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Add Character Form */}
      <AddCharacterForm
        characterRegion={characterRegion}
        bulkNamesInput={bulkNamesInput}
        isLoading={isLoading}
        onRegionChange={setCharacterRegion}
        onBulkNamesChange={setBulkNamesInput}
        onSubmit={handleBulkAdd}
      />

      {/* Main Character and Experience Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MainCharacterCard
          mainCharacter={mainCharacter}
          mainLegion={mainLegion}
          mainRaidPower={mainRaidPower}
          onSelectForExpGraph={selectCharacterForExpGraph}
          onToast={handleToast}
        />

        <ExpGraphCard
          selectedExpCharacter={selectedExpCharacter}
          mainCharacter={mainCharacter}
          expChartTimePeriod={expChartTimePeriod}
          onTimePeriodChange={setExpChartTimePeriod}
          isDataRefreshing={isDataRefreshing}
        />
      </div>

      {/* Character Grid */}
      <CharacterGrid
        characters={characters}
        selectedExpCharacter={selectedExpCharacter}
        onSelectForExpGraph={selectCharacterForExpGraph}
        onMoveCharacter={moveCharacter}
        onEditBosses={handleEditBosses}
        onRemoveCharacter={removeCharacter}
        onSetAsMain={setCharacterAsMain}
        onToast={handleToast}
      />

      {/* Live Data Integration Info */}
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

      {/* Boss Editor Dialog */}
      <BossEditorDialog
        open={isBossDialogOpen}
        onOpenChange={setIsBossDialogOpen}
        characterName={pendingCharacterName}
        pendingBulkNames={pendingBulkNames}
        characters={characters}
      />
      </div>
    </Layout>
  );
};

export default Roster;
