
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';
import { GameReport } from '@/components/game/GameReport';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

// Import icons
import { CalendarPlus, ChevronRight, FileText, LayoutList, Plus, Settings, CalendarDays } from 'lucide-react';
import { Game } from '@/contexts/GameContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { games, addGame } = useGame();
  const { user, userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const form = useForm({
    defaultValues: {
      name: userProfile?.default_game_name || '',
    },
  });
  
  const activeGames = games.filter(game => game.status === 'active');
  const closedGames = games.filter(game => game.status === 'closed');

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
        startDate: new Date().toISOString(),
        endDate: null,
        status: 'active',
        players: [],
        dailyDraws: [],
        winners: [],
        owner_id: user.id
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
      navigate(`/admin/${newGame.id}`);
    } catch (error) {
      console.error("Erro ao criar jogo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o jogo. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: userProfile?.default_game_name || ''
      });
    }
  }, [open, form, userProfile]);

  const renderGameList = (gamesList: Game[], isHistory: boolean = false) => {
    if (gamesList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>{isHistory ? "Nenhum jogo encerrado recentemente." : "Nenhum jogo ativo no momento."}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gamesList.map(game => (
          <Card key={game.id} className="overflow-hidden hover:bg-card/60 transition-colors min-w-[250px] flex-grow flex flex-col">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant={isHistory ? "secondary" : "default"} className="mb-2">
                  {isHistory ? "Encerrado" : "Ativo"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(isHistory ? game.endDate! : game.startDate).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="text-lg md:text-xl truncate">{game.name}</CardTitle>
              <CardDescription className="text-xs">
                {isHistory 
                  ? `Encerrado em ${new Date(game.endDate!).toLocaleDateString()}` 
                  : `Iniciado em ${new Date(game.startDate).toLocaleDateString()}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Jogadores:</div>
                <div>{game.players.length}</div>
                <div className="text-muted-foreground">Sorteios:</div>
                <div>{game.dailyDraws.length}</div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-center gap-2">
              <DeleteGameButton gameId={game.id} variant="ghost" size="sm" />
              <GameReport game={game} variant="ghost" size="sm" />
              <Button 
                variant="outline" 
                size="sm"
                className="min-w-[90px]"
                onClick={() => navigate(isHistory ? `/history/${game.id}` : `/admin/${game.id}`)}
              >
                {isHistory ? "Visualizar" : "Administrar"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in overflow-x-hidden w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Jogo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={onSubmit}>
                <DialogHeader>
                  <DialogTitle>Criar Novo Jogo</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para criar um novo jogo.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right col-span-1">
                      Nome
                    </label>
                    <Input
                      id="name"
                      placeholder="Nome do jogo"
                      className="col-span-3"
                      {...form.register('name', { required: true })}
                      autoComplete="off"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500 col-span-4">O nome é obrigatório</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Criar Jogo</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Active Games */}
        <Card className="futuristic-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CalendarPlus className="mr-2 h-5 w-5" /> 
                Jogos Ativos
              </CardTitle>
              <CardDescription>
                Jogos em andamento no momento
              </CardDescription>
            </div>
            <LayoutList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 overflow-x-hidden">
            {renderGameList(activeGames)}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="ml-auto" onClick={() => navigate('/history')}>
              Ver histórico completo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        {/* Recent Closed Games */}
        <Card className="futuristic-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" /> 
                Jogos Recentemente Encerrados
              </CardTitle>
              <CardDescription>
                Os últimos jogos encerrados
              </CardDescription>
            </div>
            <LayoutList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 overflow-x-hidden">
            {renderGameList(closedGames.slice(0, 6), true)}
          </CardContent>
          {closedGames.length > 6 && (
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="ml-auto" onClick={() => navigate('/history')}>
                Ver todos os {closedGames.length} jogos encerrados
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
