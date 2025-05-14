
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Game } from '@/contexts/game/types';
import { MonitorDot, Users, DollarSign, Trophy } from 'lucide-react';

interface GameFinancialCardsProps {
  game: Game;
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const GameFinancialCards: React.FC<GameFinancialCardsProps> = ({ game }) => {
  // Calculate financial projections if they're not provided
  const totalSequences = game.financialProjections?.totalSequences || 
    game.players.reduce((total, player) => total + player.combinations.length, 0);
    
  const totalCollected = game.financialProjections?.totalCollected || 
    (totalSequences * (game.sequencePrice || 10));
    
  const adminProfit = game.financialProjections?.adminProfit || 
    totalCollected * ((game.adminProfitPercentage || 15) / 100);
    
  const totalPrize = game.financialProjections?.totalPrize || 
    totalCollected - adminProfit;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm md:text-base flex items-center">
            <MonitorDot className="h-4 w-4 mr-2 text-green-500" />
            Valor Arrecadado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">{formatCurrency(totalCollected)}</div>
          <p className="text-xs text-muted-foreground">
            <Users className="inline h-3 w-3 mr-1" /> 
            {totalSequences} {totalSequences === 1 ? 'sequência' : 'sequências'} de {formatCurrency(game.sequencePrice || 10)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm md:text-base flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
            Lucro do Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">{formatCurrency(adminProfit)}</div>
          <p className="text-xs text-muted-foreground">
            {game.adminProfitPercentage || 15}% do valor arrecadado
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm md:text-base flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-amber-500" />
            Prêmio Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">{formatCurrency(totalPrize)}</div>
          <p className="text-xs text-muted-foreground">
            {game.winners && game.winners.length > 0 ? (
              <>Dividido entre {game.winners.length} {game.winners.length === 1 ? 'ganhador' : 'ganhadores'}</>
            ) : (
              <>Será dividido entre os ganhadores</>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameFinancialCards;
