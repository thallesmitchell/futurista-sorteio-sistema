
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { useToast } from "@/components/ui/use-toast";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ArrowLeft, Trophy } from 'lucide-react';

// Componente para exibir números em forma de badge
const NumberBadge = ({ number, isHit }: { number: number, isHit: boolean }) => (
  <span className={`number-badge ${isHit ? 'number-badge-hit' : ''}`}>
    {number}
  </span>
);

export default function GameHistory() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { games, currentGame, setCurrentGame } = useGame();
  
  // Carregar jogo atual quando o componente montar ou o ID mudar
  useEffect(() => {
    if (!gameId) return;
    
    const game = games.find(g => g.id === gameId);
    if (game) {
      setCurrentGame(game);
    } else {
      toast({
        title: "Jogo não encontrado",
        description: "O jogo solicitado não existe ou foi removido.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
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

  // Verificar se o jogo está ativo
  if (currentGame.status === 'active') {
    navigate(`/admin/${gameId}`);
    return null;
  }

  // Obter todos os números sorteados
  const allDrawnNumbers = currentGame.dailyDraws.flatMap(draw => draw.numbers);

  // Simular geração de PDF (em uma implementação real, usaríamos react-pdf)
  const handleGeneratePdf = () => {
    toast({
      title: "Gerando PDF",
      description: "O relatório está sendo gerado e será baixado automaticamente"
    });
    
    setTimeout(() => {
      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado com sucesso"
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{currentGame.name}</h1>
            <p className="text-muted-foreground">
              Encerrado em {currentGame.endDate ? new Date(currentGame.endDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Dashboard
            </Button>
            <Button 
              className="futuristic-button" 
              onClick={handleGeneratePdf}
            >
              <Download className="mr-2 h-4 w-4" />
              Gerar Relatório PDF
            </Button>
          </div>
        </div>

        {currentGame.winners && currentGame.winners.length > 0 && (
          <Card className="futuristic-card border-primary/30">
            <CardHeader className="bg-primary/10">
              <div className="flex items-center justify-center">
                <Trophy className="h-6 w-6 mr-2 text-primary animate-pulse-glow" />
                <CardTitle className="text-xl">Vencedores</CardTitle>
              </div>
              <CardDescription>
                {currentGame.winners.length === 1 
                  ? "1 jogador acumulou 6 acertos" 
                  : `${currentGame.winners.length} jogadores acumularam 6 acertos`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentGame.winners.map(winner => (
                  <Card key={winner.id} className="overflow-hidden border border-primary/30">
                    <CardHeader className="bg-primary/10 p-4">
                      <CardTitle className="text-lg">{winner.name}</CardTitle>
                      <CardDescription>
                        <span className="font-semibold text-primary">{winner.hits || 6}</span> acertos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {winner.numbers.sort((a, b) => a - b).map(number => (
                          <NumberBadge 
                            key={number} 
                            number={number} 
                            isHit={allDrawnNumbers.includes(number)} 
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="futuristic-card">
          <CardHeader>
            <CardTitle>Histórico de Sorteios</CardTitle>
            <CardDescription>
              {currentGame.dailyDraws.length} sorteios realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Números Sorteados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentGame.dailyDraws
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(draw => (
                      <TableRow key={draw.id}>
                        <TableCell>{new Date(draw.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {draw.numbers.sort((a, b) => a - b).map(number => (
                              <NumberBadge 
                                key={number} 
                                number={number} 
                                isHit={true} 
                              />
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="futuristic-card">
          <CardHeader>
            <CardTitle>Jogadores Participantes</CardTitle>
            <CardDescription>
              {currentGame.players.length} jogadores participaram deste jogo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Números Escolhidos</TableHead>
                    <TableHead className="text-right">Acertos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentGame.players
                    .sort((a, b) => (b.hits || 0) - (a.hits || 0))
                    .map(player => {
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {player.numbers.sort((a, b) => a - b).map(number => (
                                <NumberBadge 
                                  key={number} 
                                  number={number} 
                                  isHit={allDrawnNumbers.includes(number)} 
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {player.hits || 0}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
