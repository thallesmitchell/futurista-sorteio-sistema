
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useGame, Player, DailyDraw } from '@/contexts/GameContext';
import { useToast } from "@/components/ui/use-toast";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Save, Users, Calendar, AlertTriangle, Trophy } from 'lucide-react';

// Componente para exibir números em forma de badge
const NumberBadge = ({ number, isHit }: { number: number, isHit: boolean }) => (
  <span className={`number-badge ${isHit ? 'number-badge-hit' : ''}`}>
    {number}
  </span>
);

// Componente para exibir confetes (animação de vitória)
const Confetti = () => {
  const confettiCount = 100;
  const colors = ['#ff0080', '#7b1fa2', '#00bcd4', '#ff9100', '#8bc34a'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: confettiCount }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `-5%`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${Math.random() * 3 + 2}s`,
        };
        
        return <div key={i} className="confetti" style={style} />;
      })}
    </div>
  );
};

// Componente para exibir os ganhadores em uma tabela resumida
const WinnersTable = ({ winners, allDrawnNumbers }: { winners: Player[], allDrawnNumbers: number[] }) => {
  if (winners.length === 0) return null;
  
  return (
    <div className="mb-6">
      <Card className="border border-primary/30">
        <CardHeader className="bg-primary/10 py-3">
          <div className="flex items-center justify-center">
            <Trophy className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Ganhadores</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Acertos</TableHead>
                <TableHead>Números Acertados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map(winner => (
                <TableRow key={winner.id}>
                  <TableCell className="font-medium">{winner.name}</TableCell>
                  <TableCell>{winner.hits}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {winner.numbers
                        .filter(n => allDrawnNumbers.includes(n))
                        .map(number => (
                          <NumberBadge key={number} number={number} isHit={true} />
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default function GameAdmin() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { games, currentGame, setCurrentGame, updateGame, addPlayer, updatePlayer, addDailyDraw, checkWinners } = useGame();
  
  // Estado do formulário de jogador
  const [playerName, setPlayerName] = useState('');
  const [playerNumbers, setPlayerNumbers] = useState('');
  
  // Estado do formulário de sorteio diário
  const [drawNumbers, setDrawNumbers] = useState('');
  const [drawDate, setDrawDate] = useState('');
  
  // Estados para edição de jogador
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [editPlayerNumbers, setEditPlayerNumbers] = useState('');
  
  // Estado para confirmação de encerramento
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  
  // Estado para mostrar modal de vencedores
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [winners, setWinners] = useState<Player[]>([]);
  
  // Estado para rastrear ganhadores durante o jogo
  const [currentWinners, setCurrentWinners] = useState<Player[]>([]);

  // Carregar jogo atual quando o componente montar ou o ID mudar
  useEffect(() => {
    if (!gameId) return;
    
    const game = games.find(g => g.id === gameId);
    if (game) {
      setCurrentGame(game);
      
      // Verificar jogadores com 6 ou mais acertos
      const potentialWinners = game.players.filter(p => p.hits >= 6);
      setCurrentWinners(potentialWinners);
      
      // Verificar se já existe vencedores
      if (game.winners && game.winners.length > 0) {
        setWinners(game.winners);
        setShowWinnersModal(true);
      }
    } else {
      toast({
        title: "Jogo não encontrado",
        description: "O jogo solicitado não existe ou foi removido.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
    
    // Inicializar data do sorteio com hoje
    const today = new Date().toISOString().split('T')[0];
    setDrawDate(today);
  }, [gameId, games, setCurrentGame, navigate, toast]);
  
  if (!currentGame) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-muted-foreground">Carregando jogo...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Verificar se o jogo está fechado
  if (currentGame.status === 'closed') {
    navigate(`/history/${gameId}`);
    return null;
  }

  // Verificar números já sorteados
  const allDrawnNumbers = currentGame.dailyDraws.flatMap(draw => draw.numbers);

  // Função para processar string de números, aceitando vírgula ou ponto como separador
  const processNumberString = (numberStr: string): number[] => {
    // Substituir pontos por vírgulas
    const normalizedStr = numberStr.replace(/\./g, ',');
    
    // Processar os números
    return normalizedStr
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0 && n <= 80); // Números de 1 a 80 são válidos
  };

  // Manipuladores para o formulário de jogador
  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar nome
      if (playerName.trim() === '') {
        toast({
          title: "Nome inválido",
          description: "Por favor, insira um nome para o jogador",
          variant: "destructive"
        });
        return;
      }
      
      // Validar e converter números
      const numbersArray = processNumberString(playerNumbers);
      
      if (numbersArray.length === 0) {
        toast({
          title: "Números inválidos",
          description: "Insira números válidos separados por vírgula ou ponto",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar duplicatas
      const uniqueNumbers = [...new Set(numbersArray)];
      if (uniqueNumbers.length !== numbersArray.length) {
        toast({
          title: "Números duplicados",
          description: "Remova os números duplicados da lista",
          variant: "destructive"
        });
        return;
      }
      
      // Adicionar jogador
      addPlayer(currentGame.id, {
        name: playerName,
        numbers: uniqueNumbers
      });
      
      // Limpar formulário
      setPlayerName('');
      setPlayerNumbers('');
      
      toast({
        title: "Jogador adicionado",
        description: `${playerName} foi adicionado com sucesso`
      });
      
    } catch (error) {
      toast({
        title: "Erro ao adicionar jogador",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };
  
  // Manipuladores para edição de jogador
  const openEditPlayerModal = (player: Player) => {
    setPlayerToEdit(player);
    setEditPlayerNumbers(player.numbers.join(', '));
    setIsEditingPlayer(true);
  };
  
  const handleSavePlayerEdit = () => {
    if (!playerToEdit) return;
    
    try {
      // Validar e converter números
      const numbersArray = processNumberString(editPlayerNumbers);
      
      if (numbersArray.length === 0) {
        toast({
          title: "Números inválidos",
          description: "Insira números válidos separados por vírgula ou ponto",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar duplicatas
      const uniqueNumbers = [...new Set(numbersArray)];
      if (uniqueNumbers.length !== numbersArray.length) {
        toast({
          title: "Números duplicados",
          description: "Remova os números duplicados da lista",
          variant: "destructive"
        });
        return;
      }
      
      // Atualizar jogador
      updatePlayer(currentGame.id, playerToEdit.id, {
        numbers: uniqueNumbers
      });
      
      // Fechar modal
      setIsEditingPlayer(false);
      setPlayerToEdit(null);
      
      toast({
        title: "Jogador atualizado",
        description: `Os números de ${playerToEdit.name} foram atualizados`
      });
      
    } catch (error) {
      toast({
        title: "Erro ao editar jogador",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  // Manipuladores para o sorteio diário
  const handleDrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar data
      if (!drawDate) {
        toast({
          title: "Data inválida",
          description: "Por favor, selecione uma data para o sorteio",
          variant: "destructive"
        });
        return;
      }
      
      // Validar e converter números
      const numbersArray = processNumberString(drawNumbers);
      
      if (numbersArray.length === 0) {
        toast({
          title: "Números inválidos",
          description: "Insira números válidos separados por vírgula ou ponto",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar duplicatas
      const uniqueNumbers = [...new Set(numbersArray)];
      if (uniqueNumbers.length !== numbersArray.length) {
        toast({
          title: "Números duplicados",
          description: "Remova os números duplicados da lista",
          variant: "destructive"
        });
        return;
      }
      
      // Adicionar sorteio
      const newDraw: Omit<DailyDraw, 'id'> = {
        date: drawDate,
        numbers: uniqueNumbers
      };
      
      addDailyDraw(currentGame.id, newDraw);
      
      // Limpar formulário
      setDrawNumbers('');
      
      // Verificar vencedores
      const gameWinners = checkWinners(currentGame.id);
      setCurrentWinners(currentGame.players.filter(p => p.hits >= 6));
      
      if (gameWinners.length > 0) {
        setWinners(gameWinners);
        setShowWinnersModal(true);
      }
      
      toast({
        title: "Sorteio registrado",
        description: `O sorteio do dia ${new Date(drawDate).toLocaleDateString()} foi registrado`
      });
      
    } catch (error) {
      toast({
        title: "Erro ao registrar sorteio",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };
  
  // Encerrar jogo
  const handleCloseGame = () => {
    updateGame(currentGame.id, {
      status: 'closed',
      endDate: new Date().toISOString()
    });
    
    toast({
      title: "Jogo encerrado",
      description: `O jogo "${currentGame.name}" foi encerrado com sucesso`
    });
    
    navigate(`/history/${currentGame.id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{currentGame.name}</h1>
            <p className="text-muted-foreground">
              Iniciado em {new Date(currentGame.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Voltar para Dashboard
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsConfirmingClose(true)}
            >
              Encerrar Jogo
            </Button>
          </div>
        </div>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="players" className="text-lg py-3">
              <Users className="mr-2 h-5 w-5" />
              Jogadores
            </TabsTrigger>
            <TabsTrigger value="draws" className="text-lg py-3">
              <Calendar className="mr-2 h-5 w-5" />
              Sorteios Diários
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="players" className="space-y-6">
            <Card className="futuristic-card">
              <CardHeader>
                <CardTitle>Cadastrar Novo Jogador</CardTitle>
                <CardDescription>
                  Adicione jogadores e seus números escolhidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlayerSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="player-name">Nome do Jogador</Label>
                      <Input
                        id="player-name"
                        placeholder="Ex: João Silva"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="player-numbers">
                        Números Escolhidos <span className="text-muted-foreground">(separados por vírgula ou ponto, de 1 a 80)</span>
                      </Label>
                      <Input
                        id="player-numbers"
                        placeholder="Ex: 7, 15, 23, 32, 41, 59"
                        value={playerNumbers}
                        onChange={(e) => setPlayerNumbers(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="futuristic-button">
                    Adicionar Jogador
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="futuristic-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Jogadores Cadastrados</CardTitle>
                  <CardDescription>
                    {currentGame.players.length} jogadores neste jogo
                  </CardDescription>
                </div>
                {currentWinners.length > 0 && (
                  <Alert className="w-auto bg-primary/10 border-primary text-primary px-4 py-2 m-0">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <AlertTitle>GANHADOR ENCONTRADO!</AlertTitle>
                  </Alert>
                )}
              </CardHeader>
              
              <CardContent>
                {currentWinners.length > 0 && (
                  <WinnersTable winners={currentWinners} allDrawnNumbers={allDrawnNumbers} />
                )}
                
                {currentGame.players.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentGame.players.map(player => {
                      // Verificar acertos
                      const playerHits = player.numbers.filter(n => allDrawnNumbers.includes(n));
                      const isWinner = player.hits >= 6;
                      
                      return (
                        <Card key={player.id} className={`overflow-hidden ${isWinner ? 'border border-primary' : 'border border-border/30'}`}>
                          <CardHeader className={`p-4 ${isWinner ? 'bg-primary/20' : 'bg-muted/20'}`}>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                {player.name}
                                {isWinner && <Trophy className="h-4 w-4 ml-2 text-primary" />}
                              </CardTitle>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditPlayerModal(player)}
                              >
                                Editar
                              </Button>
                            </div>
                            <CardDescription>
                              <span className={`font-semibold ${isWinner ? 'text-primary' : ''}`}>{player.hits || 0}</span> acertos
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {player.numbers.sort((a, b) => a - b).map(number => (
                                <NumberBadge 
                                  key={number} 
                                  number={number} 
                                  isHit={allDrawnNumbers.includes(number)} 
                                />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum jogador cadastrado.</p>
                    <p className="mt-2">Adicione jogadores usando o formulário acima.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="draws" className="space-y-6">
            <Card className="futuristic-card">
              <CardHeader>
                <CardTitle>Registrar Sorteio Diário</CardTitle>
                <CardDescription>
                  Adicione os números sorteados no dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDrawSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="draw-date">Data do Sorteio</Label>
                      <Input
                        id="draw-date"
                        type="date"
                        value={drawDate}
                        onChange={(e) => setDrawDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="draw-numbers">
                        Números Sorteados <span className="text-muted-foreground">(separados por vírgula ou ponto, de 1 a 80)</span>
                      </Label>
                      <Input
                        id="draw-numbers"
                        placeholder="Ex: 7, 15, 23, 32, 41, 59"
                        value={drawNumbers}
                        onChange={(e) => setDrawNumbers(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="futuristic-button">
                    Registrar Sorteio
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="futuristic-card">
              <CardHeader>
                <CardTitle>Histórico de Sorteios</CardTitle>
                <CardDescription>
                  {currentGame.dailyDraws.length} sorteios realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentGame.dailyDraws.length > 0 ? (
                  <div className="space-y-4">
                    {currentGame.dailyDraws
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(draw => (
                        <Card key={draw.id} className="overflow-hidden border border-border/30">
                          <CardHeader className="bg-muted/20 p-4">
                            <CardTitle className="text-lg">
                              Sorteio do dia {new Date(draw.date).toLocaleDateString()}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {draw.numbers.sort((a, b) => a - b).map(number => (
                                <NumberBadge 
                                  key={number} 
                                  number={number} 
                                  isHit={true} 
                                />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum sorteio registrado.</p>
                    <p className="mt-2">Adicione sorteios usando o formulário acima.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de edição de jogador */}
      <Dialog open={isEditingPlayer} onOpenChange={setIsEditingPlayer}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
            <DialogDescription>
              Edite os números escolhidos pelo jogador {playerToEdit?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-numbers">
                Números Escolhidos <span className="text-muted-foreground">(separados por vírgula ou ponto, de 1 a 80)</span>
              </Label>
              <Input
                id="edit-numbers"
                placeholder="Ex: 7, 15, 23, 32, 41, 59"
                value={editPlayerNumbers}
                onChange={(e) => setEditPlayerNumbers(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingPlayer(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlayerEdit} className="futuristic-button">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação para encerrar jogo */}
      <Dialog open={isConfirmingClose} onOpenChange={setIsConfirmingClose}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>Encerrar Jogo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja encerrar este jogo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Ao encerrar o jogo, não será possível adicionar novos jogadores ou registrar sorteios.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingClose(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleCloseGame}>
              Encerrar Jogo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de vencedores */}
      <Dialog open={showWinnersModal} onOpenChange={setShowWinnersModal}>
        <DialogContent className="glass-panel">
          {showWinnersModal && <Confetti />}
          <DialogHeader>
            <DialogTitle className="text-2xl text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center justify-center">
              <Trophy className="h-6 w-6 mr-2 text-primary" />
              Temos um Vencedor!
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              Parabéns aos jogadores que acumularam 6 acertos!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {winners.map(winner => (
                <div key={winner.id} className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-xl font-bold">{winner.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {winner.numbers
                      .filter(n => allDrawnNumbers.includes(n))
                      .sort((a, b) => a - b)
                      .map(number => (
                        <NumberBadge 
                          key={number} 
                          number={number} 
                          isHit={true} 
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full futuristic-button" 
              onClick={() => {
                setShowWinnersModal(false);
                if (winners.length > 0) {
                  updateGame(currentGame.id, {
                    status: 'closed',
                    endDate: new Date().toISOString(),
                    winners
                  });
                  navigate(`/history/${currentGame.id}`);
                }
              }}
            >
              Encerrar Jogo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
