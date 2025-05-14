
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import GameCreationForm from '@/components/game/GameCreationForm';
import { UserProfile } from '@/contexts/auth/types';

interface DashboardHeaderProps {
  user: UserProfile | null;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
  onCreateGameSuccess: (gameId: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  onCreateGameSuccess
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Painel de Controle</h1>
        <p className="text-muted-foreground">
          Olá, {user?.email?.split('@')[0] || 'Admin'}.
          Gerencie seus jogos e acompanhe resultados.
        </p>
      </div>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus size={16} />
            Criar Novo Jogo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <GameCreationForm
            onSuccess={onCreateGameSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
