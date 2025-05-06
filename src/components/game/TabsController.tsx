
import React from 'react';
import { Player, DailyDraw } from '@/contexts/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users } from 'lucide-react';
import { PlayerForm } from './PlayerForm';
import { PlayersList } from './PlayersList';
import { DrawForm } from './DrawForm';
import { DrawsList } from './DrawsList';

interface TabsControllerProps {
  players: Player[];
  dailyDraws: DailyDraw[];
  allDrawnNumbers: number[];
  currentWinners: Player[];
  processNumberString: (numberStr: string) => number[];
  onAddPlayer: (name: string, numbersArray: number[]) => void;
  onEditPlayer: (player: Player) => void;
  onAddDraw: (date: string, numbersArray: number[]) => void;
}

export const TabsController: React.FC<TabsControllerProps> = ({ 
  players,
  dailyDraws,
  allDrawnNumbers,
  currentWinners,
  processNumberString,
  onAddPlayer,
  onEditPlayer,
  onAddDraw
}) => {
  return (
    <Tabs defaultValue="players" className="w-full">
      <TabsList className="grid grid-cols-2 mb-8">
        <TabsTrigger value="players" className="text-lg py-3">
          <Users className="mr-2 h-5 w-5" />
          Jogadores
        </TabsTrigger>
        <TabsTrigger value="draws" className="text-lg py-3">
          <Calendar className="mr-2 h-5 w-5" />
          Sorteios Diários
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="players" className="space-y-6">
        <PlayerForm onAddPlayer={onAddPlayer} processNumberString={processNumberString} />
        <PlayersList 
          players={players} 
          allDrawnNumbers={allDrawnNumbers} 
          currentWinners={currentWinners} 
          onEditPlayer={onEditPlayer} 
        />
      </TabsContent>
      
      <TabsContent value="draws" className="space-y-6">
        <DrawForm onAddDraw={onAddDraw} processNumberString={processNumberString} />
        <DrawsList draws={dailyDraws} />
      </TabsContent>
    </Tabs>
  );
};
