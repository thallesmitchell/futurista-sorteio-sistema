
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { FinancialProjection } from '@/contexts/game/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export default function FinancialView() {
  const { gameId } = useParams<{ gameId: string }>();
  const { games, financialSummary } = useGame();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState(false);
  const [activeChart, setActiveChart] = useState<'totalRevenue' | 'adminProfit'>('totalRevenue');
  const [selectedGame, setSelectedGame] = useState<FinancialProjection | null>(null);
  const [filteredGames, setFilteredGames] = useState<FinancialProjection[]>([]);
  const [chartData, setChartData] = useState<FinancialProjection[]>([]);

  // Get financial data when games change
  useEffect(() => {
    const fetchFinancial = async () => {
      try {
        // If specific game ID, filter for just that game
        if (gameId && games.length > 0) {
          const game = games.find((g) => g.id === gameId);
          if (!game) {
            toast({
              title: "Jogo não encontrado",
              description: "Não foi possível encontrar os dados financeiros para este jogo",
              variant: "destructive",
            });
            return;
          }

          // Convert game financial projections to FinancialProjection type
          if (game.financialProjections) {
            const gameProjection: FinancialProjection = {
              id: game.id,
              name: game.name,
              status: game.status,
              start_date: game.start_date,
              end_date: game.end_date,
              totalRevenue: game.financialProjections.totalCollected || 0,
              revenue: game.financialProjections.totalCollected || 0,
              adminProfit: game.financialProjections.adminProfit || 0,
              profit: game.financialProjections.adminProfit || 0,
              prizePool: game.financialProjections.totalPrize || 0,
              playerCount: game.players?.length || 0,
              combinationCount: game.financialProjections.totalSequences || 0,
              averagePayout: game.players?.length ? (game.financialProjections.totalPrize || 0) / game.players.length : 0,
              totalSequences: game.financialProjections.totalSequences,
              sequencePrice: game.sequencePrice,
              adminProfitPercentage: game.adminProfitPercentage,
              totalCollected: game.financialProjections.totalCollected,
              totalPrize: game.financialProjections.totalPrize
            };
            
            setFilteredGames([gameProjection]);
            setChartData([gameProjection]);
          }
        } else {
          // Get all games' financial data from context
          if (financialSummary && typeof financialSummary === 'function') {
            const projections = financialSummary();
            if (projections && Array.isArray(projections)) {
              setFilteredGames(projections);
              // Default to showing only first 5 games in chart
              setChartData(showAll ? projections : projections.slice(0, 5));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching financial data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um problema ao carregar os dados financeiros",
          variant: "destructive",
        });
      }
    };

    fetchFinancial();
  }, [games, gameId, showAll, financialSummary, toast]);

  // Toggle showing all games in chart
  const toggleShowAll = () => {
    if (!showAll && filteredGames.length > 5) {
      setChartData(filteredGames);
      setShowAll(true);
    } else {
      setChartData(filteredGames.slice(0, 5));
      setShowAll(false);
    }
  };

  // Handle clicking on a chart item
  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedItem = data.activePayload[0].payload;
      setSelectedGame(clickedItem);
    }
  };

  if (!filteredGames.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <h3 className="text-lg font-medium">Carregando dados financeiros...</h3>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Análise Financeira dos Jogos</CardTitle>
          <CardDescription>
            Visão geral do desempenho financeiro dos seus jogos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveChart('totalRevenue')} 
              className={activeChart === 'totalRevenue' ? 'bg-primary text-primary-foreground' : ''}
            >
              Receita
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveChart('adminProfit')} 
              className={activeChart === 'adminProfit' ? 'bg-primary text-primary-foreground' : ''}
            >
              Lucro
            </Button>
          </div>
          <Separator />
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
                onClick={handleChartClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey={activeChart} stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {!isMobile && filteredGames.length > 5 && (
            <Button variant="secondary" onClick={toggleShowAll}>
              {showAll ? "Mostrar menos" : "Mostrar todos"}
            </Button>
          )}
          {selectedGame && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold">Detalhes do Jogo Selecionado</h4>
              <p>Nome: {selectedGame.name}</p>
              <p>Receita: R$ {selectedGame.totalRevenue.toFixed(2)}</p>
              <p>Lucro: R$ {selectedGame.adminProfit.toFixed(2)}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Lista de Jogos</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredGames.map((game) => (
            <Card key={game.id}>
              <CardHeader>
                <CardTitle>{game.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">ID: {game.id}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Receita: R$ {game.totalRevenue.toFixed(2)}</p>
                <p>Lucro: R$ {game.adminProfit.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
