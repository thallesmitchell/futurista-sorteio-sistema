
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import GameCreationForm from '@/components/game/GameCreationForm';
import { User } from '@supabase/supabase-js';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardHeaderProps {
  user: User | null;
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
  const isMobile = useIsMobile();
  
  return (
    <div className="dashboard-header">
      <div className="w-full md:w-auto">
        <h1 className="dashboard-title">Painel de Controle</h1>
        <p className="dashboard-description">
          Olá, {user?.email?.split('@')[0] || 'Admin'}.
          Gerencie seus jogos e acompanhe resultados.
        </p>
      </div>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 mt-2 md:mt-0 w-full md:w-auto">
            <Plus size={18} />
            Criar Novo Jogo
          </Button>
        </DialogTrigger>
        <DialogContent className={`${isMobile ? 'p-4 mobile-dialog' : 'p-5'} sm:max-w-md`}>
          <GameCreationForm
            onSuccess={onCreateGameSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
