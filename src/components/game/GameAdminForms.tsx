
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerForm } from '@/components/game/PlayerForm';
import { DrawForm } from '@/components/game/DrawForm';
import { UserPlus, CalendarDays } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameAdminFormsProps {
  gameId: string;
}

export const GameAdminForms: React.FC<GameAdminFormsProps> = ({ gameId }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="p-3 md:p-5 backdrop-blur-sm bg-card/40 border-primary/20">
      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid grid-cols-2 mb-3 md:mb-4">
          <TabsTrigger value="players" className="data-[state=active]:bg-primary/20 text-xs md:text-sm">
            <UserPlus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Cadastrar</span> Novo Jogador
          </TabsTrigger>
          <TabsTrigger value="draws" className="data-[state=active]:bg-primary/20 text-xs md:text-sm">
            <CalendarDays className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Registrar</span> Sorteio Diário
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="players">
          <PlayerForm gameId={gameId} />
        </TabsContent>
        
        <TabsContent value="draws">
          <DrawForm gameId={gameId} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
