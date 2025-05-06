
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useGame, Game } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { Plus, ChevronRight, FileText } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { games, addGame } = useGame();
  const { toast } = useToast();
  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState(false);
  const [newGameName, setNewGameName] = useState('');

  const activeGames = games.filter(game => game.status === 'active');
  const closedGames = games.filter(game => game.status === 'closed');

  const handleCreateGame = () => {
    if (newGameName.trim() === '') {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome para o jogo",
        variant: "destructive"
      });
      return;
    }

    const newGame: Omit<Game, 'id'> = {
      name: newGameName,
      startDate: new Date().toISOString(),
      endDate: null,
      status: 'active',
      players: [],
      dailyDraws: [],
      winners: []
    };

    const createdGame = addGame(newGame);
    setNewGameName('');
    setIsNewGameDialogOpen(false);

    toast({
      title: "Jogo criado com sucesso",
      description: `O jogo "${newGameName}" foi criado.`
    });

    // Navegar para o painel de administração do novo jogo
    navigate(`/admin/${createdGame.id}`);
  };

  // Handler for generating report for active games
  const handleGenerateReport = (gameId: string) => {
    navigate(`/history/${gameId}`);
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Painel de Controle</h1>
          <Button 
            onClick={() => setIsNewGameDialogOpen(true)} 
            className="futuristic-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Iniciar Novo Jogo
          </Button>
        </div>

        <Card className="futuristic-card">
          <CardHeader>
            <CardTitle>Jogos em Andamento</CardTitle>
            <CardDescription>
              Gerencie os jogos ativos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeGames.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data de Início</TableHead>
                    <TableHead>Jogadores</TableHead>
                    <TableHead>Sorteios</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeGames.map(game => (
                    <TableRow key={game.id}>
                      <TableCell className="font-medium">{game.name}</TableCell>
                      <TableCell>{new Date(game.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{game.players.length}</TableCell>
                      <TableCell>{game.dailyDraws.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleGenerateReport(game.id)}
                            className="flex items-center"
                          >
                            <FileText className="mr-1 h-4 w-4" />
                            Relatório
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => navigate(`/admin/${game.id}`)}
                          >
                            Administrar
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum jogo ativo no momento.</p>
                <Button 
                  variant="link" 
                  onClick={() => setIsNewGameDialogOpen(true)}
                  className="mt-2"
                >
                  Criar um novo jogo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="futuristic-card">
          <CardHeader>
            <CardTitle>Jogos Encerrados</CardTitle>
            <CardDescription>
              Histórico de jogos finalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {closedGames.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data de Início</TableHead>
                    <TableHead>Data de Encerramento</TableHead>
                    <TableHead>Jogadores</TableHead>
                    <TableHead>Ganhadores</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedGames.map(game => (
                    <TableRow key={game.id}>
                      <TableCell className="font-medium">{game.name}</TableCell>
                      <TableCell>{new Date(game.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{game.endDate && new Date(game.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{game.players.length}</TableCell>
                      <TableCell>{game.winners.length}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/history/${game.id}`)}
                        >
                          Visualizar Resultado
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum jogo encerrado no histórico.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isNewGameDialogOpen} onOpenChange={setIsNewGameDialogOpen}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>Criar Novo Jogo</DialogTitle>
            <DialogDescription>
              Insira as informações para iniciar um novo jogo de sorteio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="game-name">Nome do Jogo</Label>
              <Input
                id="game-name"
                placeholder="Ex: Sorteio Mensal - Junho 2025"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewGameDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateGame} className="futuristic-button">
              Criar Jogo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
