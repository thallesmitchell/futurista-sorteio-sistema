
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BarChart, Settings, List, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/contexts/game';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={cn(
      "flex flex-col items-center justify-center flex-1 py-3 px-1.5",
      active ? "text-primary" : "text-muted-foreground"
    )}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export function MobileNavBar() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeRoute, setActiveRoute] = React.useState('/dashboard');
  const [open, setOpen] = useState(false);
  const { games, addGame } = useGame();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: userProfile?.default_game_name || '',
    },
  });
  
  React.useEffect(() => {
    const path = window.location.pathname;
    setActiveRoute(path);
  }, []);
  
  React.useEffect(() => {
    if (!open) {
      form.reset({
        name: userProfile?.default_game_name || ''
      });
    }
  }, [open, form, userProfile]);
  
  const navigateTo = (route: string) => {
    navigate(route);
    setActiveRoute(route);
  };
  
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um jogo.",
          variant: "destructive"
        });
        return;
      }
      
      // Add owner_id to the new game
      const newGame = await addGame({
        name: data.name,
        start_date: new Date().toISOString(),
        end_date: null,
        status: 'active',
        players: [],
        dailyDraws: [],
        winners: [],
        owner_id: user.id,
        numbersPerSequence: 6,
        requiredHits: 6,
        sequencePrice: 10,
        adminProfitPercentage: 15
      });
      
      // Reset form
      form.reset();
      
      // Close modal
      setOpen(false);
      
      // Notify user
      toast({
        title: "Jogo criado!",
        description: `O jogo "${data.name}" foi criado com sucesso.`,
      });
      
      // Redirect to game page
      navigate(`/game/${newGame.id}`);
    } catch (error) {
      console.error("Erro ao criar jogo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o jogo. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  if (!isMobile) return null;
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40 rounded-t-xl">
        <nav className="flex items-center justify-around">
          <NavItem 
            icon={<Home size={20} />} 
            label="Início" 
            active={activeRoute === '/dashboard'} 
            onClick={() => navigateTo('/dashboard')} 
          />
          <NavItem 
            icon={<List size={20} />} 
            label="Jogos" 
            active={activeRoute.includes('/game/')} 
            onClick={() => navigateTo('/history')} 
          />
          <NavItem 
            icon={
              <div className="bg-primary text-primary-foreground rounded-full p-3 -mt-7 shadow-lg border-4 border-background">
                <Plus size={24} />
              </div>
            } 
            label="" 
            onClick={() => setOpen(true)} 
          />
          <NavItem 
            icon={<BarChart size={20} />} 
            label="Histórico" 
            active={activeRoute === '/history'} 
            onClick={() => navigateTo('/history')} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Config." 
            active={activeRoute === '/settings'} 
            onClick={() => navigateTo('/settings')} 
          />
        </nav>
        <div className="h-safe-bottom bg-background"></div>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] p-5 mobile-dialog">
          <form onSubmit={onSubmit}>
            <DialogHeader className="mb-4 text-left">
              <DialogTitle className="text-xl mb-2">Criar Novo Jogo</DialogTitle>
              <DialogDescription className="text-sm">
                Preencha os dados para criar um novo jogo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <div className="grid grid-cols-4 items-center gap-3">
                <label htmlFor="name" className="text-right col-span-1 text-sm">
                  Nome
                </label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    placeholder="Nome do jogo"
                    className="w-full mb-0"
                    {...form.register('name', { required: true })}
                    autoComplete="off"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500 mt-1">O nome é obrigatório</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Criar Jogo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
