
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerForm } from '@/components/game/PlayerForm';
import { DrawForm } from '@/components/game/DrawForm';
import { UserPlus, CalendarDays } from 'lucide-react';

interface GameAdminFormsProps {
  gameId: string;
}

export const GameAdminForms: React.FC<GameAdminFormsProps> = ({ gameId }) => {
  return (
    <Card className="p-5 backdrop-blur-sm bg-card/40 border-primary/20">
      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="players" className="data-[state=active]:bg-primary/20">
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar Novo Jogador
          </TabsTrigger>
          <TabsTrigger value="draws" className="data-[state=active]:bg-primary/20">
            <CalendarDays className="mr-2 h-4 w-4" />
            Registrar Sorteio Diário
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
