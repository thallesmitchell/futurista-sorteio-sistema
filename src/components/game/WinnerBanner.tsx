
import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Player } from '@/contexts/game/types';
import { Card } from '@/components/ui/card';
import { NumberBadge } from './NumberBadge';
import { useIsMobile } from '@/hooks/use-mobile';

interface WinnerBannerProps {
  winners: Player[];
  allDrawnNumbers: number[];
}

export const WinnerBanner: React.FC<WinnerBannerProps> = ({ winners, allDrawnNumbers }) => {
  const isMobile = useIsMobile();
  const [winningEntries, setWinningEntries] = useState<Array<{playerName: string, numbers: number[]}>>([]); 

  // Process winners whenever the winners prop changes
  useEffect(() => {
    // If no winners, don't render anything
    if (!winners || winners.length === 0) {
      return;
    }
    
    // Get winning combinations (6 hits)
    const entries = winners.flatMap(winner => 
      winner.combinations
        .filter(combo => combo.hits === 6)
        .map(combo => ({ 
          playerName: winner.name, 
          numbers: combo.numbers 
        }))
    );

    // If somehow there are winners but no winning combinations, don't render
    if (entries.length === 0) {
      return;
    }
    
    setWinningEntries(entries);
  }, [winners]);

  // Don't render anything if no winning entries
  if (!winners?.length || winningEntries.length === 0) {
    return null;
  }

  return (
    <Card className="w-full border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] bg-green-500/10 overflow-hidden mb-4 animate-glow-green">
      <div className="p-3 md:p-4 space-y-2 md:space-y-3">
        <div className="flex items-center justify-center gap-2 text-center">
          <Trophy className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
          <h2 className="text-lg md:text-xl font-bold text-green-500">
            {winners.length > 1 ? 'Vencedores Encontrados!' : 'Vencedor Encontrado!'}
          </h2>
          <Trophy className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {winningEntries.map((entry, index) => (
            <div 
              key={`winner-entry-${index}`} 
              className="bg-green-500/20 p-2 md:p-3 rounded-lg border border-green-500/50"
            >
              <p className="font-semibold text-sm md:text-base mb-1 text-green-400">
                {entry.playerName}
              </p>
              <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
                {entry.numbers
                  .sort((a, b) => a - b)
                  .map((number, idx) => (
                    <NumberBadge
                      key={`${index}-${idx}`}
                      number={number}
                      size={isMobile ? "sm" : "md"}
                      isHit={true}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
