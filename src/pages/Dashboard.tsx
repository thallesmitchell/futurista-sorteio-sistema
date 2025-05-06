
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
import { GameReport } from '@/components/game/GameReport';

// Import icons
import { CalendarPlus, ChevronRight, FileText, LayoutList, Plus, Settings } from 'lucide-react';
import { Game } from '@/contexts/GameContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // Adicionar novo jogo e esperar pela resposta
      const newGame = await addGame({
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
      form.reset();
    }
  }, [open, form]);

  const renderGameList = (gamesList: Game[], isHistory: boolean = false) => {
    if (gamesList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>{isHistory ? "Nenhum jogo encerrado recentemente." : "Nenhum jogo ativo no momento."}</p>
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nome do Jogo</TableHead>
              <TableHead className="hidden sm:table-cell">{isHistory ? "Encerrado em" : "Iniciado em"}</TableHead>
              <TableHead className="hidden md:table-cell">Jogadores</TableHead>
              <TableHead className="hidden md:table-cell">Sorteios</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gamesList.map(game => (
              <TableRow key={game.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{game.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {new Date(isHistory ? game.endDate! : game.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="hidden md:table-cell">{game.players.length}</TableCell>
                <TableCell className="hidden md:table-cell">{game.dailyDraws.length}</TableCell>
                <TableCell className="text-right space-x-1">
                  <DeleteGameButton gameId={game.id} variant="ghost" size="sm" />
                  <GameReport game={game} variant="ghost" size="sm" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(isHistory ? `/history/${game.id}` : `/admin/${game.id}`)}
                  >
                    {isHistory ? "Visualizar" : "Administrar"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

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
          <CardContent>
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
              <CardTitle>Jogos Recentemente Encerrados</CardTitle>
              <CardDescription>
                Os últimos jogos encerrados
              </CardDescription>
            </div>
            <LayoutList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderGameList(closedGames.slice(0, 5), true)}
          </CardContent>
          {closedGames.length > 5 && (
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
