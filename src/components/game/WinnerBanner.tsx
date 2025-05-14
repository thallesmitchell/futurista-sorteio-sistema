
import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Users } from 'lucide-react';
import { Player, Game, Winner } from '@/contexts/game/types';
import { formatCurrency } from './GameFinancialCards';

interface WinnerBannerProps {
  game: Game;
  winners: (Player & { prize_amount?: number })[];
  className?: string;
}

export const WinnerBanner: React.FC<WinnerBannerProps> = ({ 
  game, 
  winners, 
  className 
}) => {
  if (!winners || winners.length === 0) return null;

  // Calculate total prize if possible
  const totalPrize = game.financialProjections?.totalPrize || 
    calculatePrize(game);
    
  // Split prize evenly among winners if not individually specified
  const prizePerWinner = totalPrize / winners.length;
  
  return (
    <div className={cn(
      "bg-gradient-to-r from-amber-300 to-yellow-400 rounded-lg p-4 text-black shadow-lg",
      className
    )}>
      <div className="flex items-center mb-2">
        <Trophy className="w-6 h-6 mr-2 text-amber-700" />
        <h3 className="font-bold text-lg">
          {winners.length > 1 ? 'Ganhadores Encontrados!' : 'Ganhador Encontrado!'}
        </h3>
      </div>
      
      <p className="mb-3">
        {winners.length > 1 
          ? `${winners.length} jogadores acertaram todos os números e dividirão o prêmio.`
          : `${winners[0].name} acertou todos os números e ganhou o prêmio!`
        }
      </p>
      
      {winners.length > 1 && (
        <div className="bg-white bg-opacity-30 rounded-md p-3 mb-2">
          <div className="flex items-start mb-1">
            <Users className="w-4 h-4 mt-1 mr-1 flex-shrink-0" />
            <div>
              <strong>Ganhadores:</strong>{' '}
              {winners.map((winner, index) => (
                <span key={winner.id}>
                  {winner.name}
                  {index < winners.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white bg-opacity-30 rounded-md p-3">
        <div className="flex justify-between">
          <span>Valor do prêmio:</span>
          <span className="font-bold">{formatCurrency(totalPrize)}</span>
        </div>
        
        {winners.length > 1 && (
          <div className="flex justify-between mt-1">
            <span>Por ganhador:</span>
            <span className="font-bold">{formatCurrency(prizePerWinner)}</span>
          </div>
        )}
        
        {winners.some(w => w.prize_amount !== undefined) && (
          <div className="mt-2 text-sm">
            {winners.map(winner => 
              winner.prize_amount !== undefined ? (
                <div key={winner.id} className="flex justify-between">
                  <span>{winner.name}:</span>
                  <span>{formatCurrency(winner.prize_amount)}</span>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate prize
const calculatePrize = (game: Game): number => {
  const totalSequences = game.players.reduce(
    (sum, player) => sum + player.combinations.length, 
    0
  );
  
  const totalCollected = totalSequences * (game.sequencePrice || 10);
  const adminProfitPercentage = game.adminProfitPercentage || 15;
  const adminProfit = totalCollected * (adminProfitPercentage / 100);
  
  return totalCollected - adminProfit;
};

export default WinnerBanner;
