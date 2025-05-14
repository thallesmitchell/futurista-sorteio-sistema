
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Hourglass } from 'lucide-react';
import { Game } from '@/contexts/game/types';
import { GamesList } from './GamesList';

interface GamesTabsProps {
  activeGames: Game[];
  closedGames: Game[];
  onCreateGame: () => void;
}

export const GamesTabs: React.FC<GamesTabsProps> = ({
  activeGames,
  closedGames,
  onCreateGame
}) => {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="active" className="py-3">
          <Hourglass className="mr-2 h-4 w-4" />
          Jogos Ativos ({activeGames.length})
        </TabsTrigger>
        <TabsTrigger value="closed" className="py-3">
          <CheckCircle className="mr-2 h-4 w-4" />
          Jogos Encerrados ({closedGames.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="pt-2">
        <GamesList 
          games={activeGames} 
          status="active" 
          onCreateGame={onCreateGame}
        />
      </TabsContent>
      
      <TabsContent value="closed" className="pt-2">
        <GamesList 
          games={closedGames} 
          status="closed" 
          onCreateGame={onCreateGame}
        />
      </TabsContent>
    </Tabs>
  );
};
