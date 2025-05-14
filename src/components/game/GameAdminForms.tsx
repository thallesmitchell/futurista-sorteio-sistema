
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerForm } from '@/components/game/PlayerForm';
import { DrawForm } from '@/components/game/DrawForm';
import { UserPlus, CalendarDays } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameAdminFormsProps {
  gameId: string;
  onNewWinnerFound?: (hasWinners: boolean) => void;
}

export const GameAdminForms: React.FC<GameAdminFormsProps> = ({ gameId, onNewWinnerFound }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="p-4 md:p-6 backdrop-blur-sm bg-card/40 border-primary/20">
      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 md:mb-5">
          <TabsTrigger value="players" className="data-[state=active]:bg-primary/20 py-2 md:py-3 text-xs md:text-sm">
            <UserPlus className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Cadastrar</span> Novo Jogador
          </TabsTrigger>
          <TabsTrigger value="draws" className="data-[state=active]:bg-primary/20 py-2 md:py-3 text-xs md:text-sm">
            <CalendarDays className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Registrar</span> Sorteio Diário
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="players" className="pt-2">
          <PlayerForm gameId={gameId} />
        </TabsContent>
        
        <TabsContent value="draws" className="pt-2">
          <DrawForm gameId={gameId} onNewWinnerFound={onNewWinnerFound} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
