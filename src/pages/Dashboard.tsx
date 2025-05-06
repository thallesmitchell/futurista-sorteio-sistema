
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';

// Import icons
import { CalendarPlus, ChevronRight, Plus, Settings } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { games, addGame } = useGame();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: '',
    },
  });
  
  const activeGames = games.filter(game => game.status === 'active');
  const closedGames = games.filter(game => game.status === 'closed');

  const onSubmit = form.handleSubmit((data) => {
    // Adicionar novo jogo
    const newGame = addGame({
      name: data.name,
      startDate: new Date().toISOString(),
      endDate: null,
      status: 'active',
      players: [],
      dailyDraws: [],
      winners: []
    });
    
    // Resetar formulário
    form.reset();
    
    // Fechar modal
    setOpen(false);
    
    // Notificar usuário
    toast({
      title: "Jogo criado!",
      description: `O jogo "${data.name}" foi criado com sucesso.`,
    });
    
    // Redirecionar para página do jogo
    navigate(`/admin/${newGame.id}`);
  });
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
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
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarPlus className="mr-2 h-5 w-5" /> 
              Jogos Ativos
            </CardTitle>
            <CardDescription>
              Jogos em andamento no momento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGames.map((game) => (
                  <Card key={game.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <CardDescription>
                        Iniciado em {new Date(game.startDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span>Total de jogadores:</span>
                          <span className="font-medium">{game.players.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sorteios realizados:</span>
                          <span className="font-medium">{game.dailyDraws.length}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <DeleteGameButton gameId={game.id} variant="ghost" size="sm" />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto" 
                        onClick={() => navigate(`/admin/${game.id}`)}
                      >
                        Administrar
                        <Settings className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum jogo ativo no momento.</p>
              </div>
            )}
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
          <CardHeader>
            <CardTitle>Jogos Recentemente Encerrados</CardTitle>
            <CardDescription>
              Os 3 últimos jogos encerrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {closedGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {closedGames.slice(0, 3).map((game) => (
                  <Card key={game.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <CardDescription>
                        Encerrado em {new Date(game.endDate!).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span>Total de jogadores:</span>
                          <span className="font-medium">{game.players.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ganhadores:</span>
                          <span className="font-medium">{game.winners.length}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <DeleteGameButton gameId={game.id} variant="ghost" size="sm" />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto" 
                        onClick={() => navigate(`/history/${game.id}`)}
                      >
                        Visualizar
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum jogo encerrado recentemente.</p>
              </div>
            )}
          </CardContent>
          {closedGames.length > 3 && (
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
