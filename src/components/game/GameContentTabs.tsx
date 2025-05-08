
import React from 'react';
import { TabsController } from '@/components/game/TabsController';
import { TabsContent } from '@/components/ui/tabs';
import PlayersList from '@/components/game/PlayersList';
import DrawsList from '@/components/game/DrawsList';
import { Player, DailyDraw } from '@/contexts/game/types';

interface GameContentTabsProps {
  players: Player[];
  draws: DailyDraw[];
  allDrawnNumbers: number[];
  onEditPlayer: (player: Player) => void;
  currentWinners: Player[];
  gameId: string;
}

export const GameContentTabs: React.FC<GameContentTabsProps> = ({
  players,
  draws,
  allDrawnNumbers,
  onEditPlayer,
  currentWinners,
  gameId
}) => {
  return (
    <TabsController defaultValue="players">
      <TabsContent value="players">
        <PlayersList 
          players={players} 
          allDrawnNumbers={allDrawnNumbers}
          onEditPlayer={onEditPlayer}
          currentWinners={currentWinners}
          gameId={gameId}
        />
      </TabsContent>
      
      <TabsContent value="draws">
        <DrawsList 
          draws={draws} 
          isReadOnly={false}
        />
      </TabsContent>
    </TabsController>
  );
};
