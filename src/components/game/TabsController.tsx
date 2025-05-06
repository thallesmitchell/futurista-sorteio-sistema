
import React from 'react';
import { Player, DailyDraw } from '@/contexts/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users } from 'lucide-react';
import { PlayerForm } from './PlayerForm';
import { PlayersList } from './PlayersList';
import { DrawForm } from './DrawForm';
import { DrawsList } from './DrawsList';
import { useIsMobile } from '@/hooks/use-mobile';

interface TabsControllerProps {
  players: Player[];
  dailyDraws: DailyDraw[];
  allDrawnNumbers: number[];
  currentWinners: Player[];
  processNumberString: (numberStr: string) => number[];
  onAddPlayer: (name: string, numbersArray: number[]) => void;
  onAddCombination: (playerId: string, numbersArray: number[]) => void;
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
  onAddCombination,
  onEditPlayer,
  onAddDraw
}) => {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue="players" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4 md:mb-8">
        <TabsTrigger value="players" className={`${isMobile ? "text-sm py-2" : "text-lg py-3"}`}>
          <Users className={`${isMobile ? "mr-1 h-4 w-4" : "mr-2 h-5 w-5"}`} />
          Jogadores
        </TabsTrigger>
        <TabsTrigger value="draws" className={`${isMobile ? "text-sm py-2" : "text-lg py-3"}`}>
          <Calendar className={`${isMobile ? "mr-1 h-4 w-4" : "mr-2 h-5 w-5"}`} />
          Sorteios Diários
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="players" className="space-y-4 md:space-y-6">
        <PlayerForm 
          onAddPlayer={onAddPlayer} 
          onAddCombination={onAddCombination}
          processNumberString={processNumberString} 
          players={players}
        />
        <PlayersList 
          players={players} 
          allDrawnNumbers={allDrawnNumbers} 
          currentWinners={currentWinners} 
          onEditPlayer={onEditPlayer} 
        />
      </TabsContent>
      
      <TabsContent value="draws" className="space-y-4 md:space-y-6">
        <DrawForm onAddDraw={onAddDraw} processNumberString={processNumberString} />
        <DrawsList draws={dailyDraws} />
      </TabsContent>
    </Tabs>
  );
};
