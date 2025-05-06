
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
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
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  // Obter todos os números sorteados
  const allDrawnNumbers = currentGame.dailyDraws.flatMap(draw => draw.numbers);

  // Função modificada para gerar PDF usando html2pdf
  const handleGeneratePdf = () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    toast({
      title: "Gerando PDF",
      description: "O relatório está sendo gerado e será baixado automaticamente"
    });
    
    // Criar conteúdo HTML para converter em PDF
    const reportTitle = `Relatório do Jogo: ${currentGame.name}`;
    const dateInfo = `Data: ${new Date().toLocaleDateString()}`;
    const gameDate = `Jogo iniciado em: ${new Date(currentGame.startDate).toLocaleDateString()}`;
    const status = currentGame.status === 'active' ? 'Em andamento' : 'Encerrado';
    const playersCount = `Total de jogadores: ${currentGame.players.length}`;
    const drawsCount = `Total de sorteios: ${currentGame.dailyDraws.length}`;
    
    const html = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 20px; }
            h1 { color: #8B5CF6; text-align: center; }
            h2 { color: #8B5CF6; margin-top: 20px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .winner { background-color: #f3e8ff; }
            .number { display: inline-block; width: 30px; height: 30px; border-radius: 50%; 
                      background: #8B5CF6; color: white; text-align: center; line-height: 30px;
                      margin: 2px; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <div class="info">
            <p>${dateInfo}</p>
            <p>${gameDate}</p>
            <p>Status: ${status}</p>
            <p>${playersCount}</p>
            <p>${drawsCount}</p>
          </div>
          
          ${currentGame.winners && currentGame.winners.length > 0 ? `
            <h2>Ganhadores</h2>
            <table>
              <tr>
                <th>Nome</th>
                <th>Acertos</th>
              </tr>
              ${currentGame.winners.map(winner => `
                <tr class="winner">
                  <td>${winner.name}</td>
                  <td>${winner.hits || 6}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
          
          <h2>Jogadores</h2>
          <table>
            <tr>
              <th>Nome</th>
              <th>Números Escolhidos</th>
              <th>Acertos</th>
            </tr>
            ${currentGame.players.sort((a, b) => {
              const aHits = a.hits || 0;
              const bHits = b.hits || 0;
              return bHits - aHits;
            }).map(player => `
              <tr ${player.hits >= 6 ? 'class="winner"' : ''}>
                <td>${player.name}</td>
                <td>${player.combinations && player.combinations.map ? player.combinations.map(combo => 
                  `<div style="margin-bottom: 8px; border-bottom: 1px dashed #ddd; padding-bottom: 5px;">
                    ${combo.numbers && Array.isArray(combo.numbers) ? combo.numbers.sort((a, b) => a - b).map(number => 
                      `<span class="number">${number}</span>`
                    ).join('') : ''}
                    (${combo.hits || 0} acertos)
                  </div>`
                ).join('') : ''}</td>
                <td>${player.hits || 0}</td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Sorteios</h2>
          <table>
            <tr>
              <th>Data</th>
              <th>Números Sorteados</th>
            </tr>
            ${currentGame.dailyDraws.map(draw => `
              <tr>
                <td>${new Date(draw.date).toLocaleDateString()}</td>
                <td>${draw.numbers && Array.isArray(draw.numbers) ? draw.numbers.sort((a, b) => a - b).map(number => 
                  `<span class="number">${number}</span>`
                ).join('') : ''}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
    
    // Criar um elemento temporário para o conteúdo HTML
    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);
    
    // Configurações do html2pdf
    const opt = {
      margin: 10,
      filename: `relatorio-${currentGame.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Gerar o PDF e fazer download
    html2pdf().from(element).set(opt).save().then(() => {
      // Remover o elemento temporário
      document.body.removeChild(element);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório foi gerado e baixado com sucesso"
      });
      
      setIsGenerating(false);
    }).catch(error => {
      console.error("Erro ao gerar PDF:", error);
      
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um problema ao gerar o PDF. Por favor, tente novamente.",
        variant: "destructive"
      });
      
      setIsGenerating(false);
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{currentGame.name}</h1>
            <p className="text-muted-foreground">
              {currentGame.status === 'active' 
                ? `Iniciado em ${new Date(currentGame.startDate).toLocaleDateString()}` 
                : `Encerrado em ${currentGame.endDate ? new Date(currentGame.endDate).toLocaleDateString() : 'N/A'}`}
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
              disabled={isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Gerando..." : "Gerar Relatório"}
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
                        {winner.numbers && Array.isArray(winner.numbers) && winner.numbers
                          .sort((a, b) => a - b)
                          .map(number => (
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
                            {draw.numbers && Array.isArray(draw.numbers) && draw.numbers
                              .sort((a, b) => a - b)
                              .map(number => (
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
                        <TableRow key={player.id} className={player.hits >= 6 ? "bg-primary/10" : ""}>
                          <TableCell className="font-medium">
                            {player.name}
                            {player.hits >= 6 && <Trophy className="inline-block h-4 w-4 ml-1 text-primary" />}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {player.numbers && Array.isArray(player.numbers) && player.numbers
                                .sort((a, b) => a - b)
                                .map(number => (
                                  <NumberBadge 
                                    key={number} 
                                    number={number} 
                                    isHit={allDrawnNumbers.includes(number)} 
                                  />
                                ))}
                            </div>
                          </TableCell>
                          <TableCell className={`text-right font-bold ${player.hits >= 6 ? "text-primary" : ""}`}>
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
