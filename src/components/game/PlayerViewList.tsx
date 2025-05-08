
import React from 'react';
import { NumberBadge } from '@/components/game/NumberBadge';
import { Player } from '@/contexts/game/types';

interface PlayerViewListProps {
  sortedPlayers: Player[];
  drawnNumbersSet: Set<number>;
}

export const PlayerViewList: React.FC<PlayerViewListProps> = ({ 
  sortedPlayers,
  drawnNumbersSet
}) => {
  return (
    <div className="columns-1 xs:columns-3 gap-3 space-y-0 w-full">
      {sortedPlayers.map((player) => (
        <div 
          key={player.id} 
          className="mb-3 inline-block w-full overflow-hidden break-inside-avoid border border-border/30 rounded-md"
        >
          <div className="p-3 border-b border-border/30 bg-muted/20">
            <h3 className="font-semibold text-base text-center">{player.name}</h3>
            <p className="text-xs text-muted-foreground text-center">
              {player.combinations.length} sequence{player.combinations.length !== 1 ? 's' : ''} | 
              Max hits: {Math.max(...player.combinations.map(c => c.hits), 0)}
            </p>
          </div>
          <div className="p-3 space-y-2">
            {player.combinations.map((combination, idx) => {
              // Check if this is a winning combination (6 hits)
              const isWinningCombo = combination.hits === 6;
              
              return (
                <div 
                  key={`${player.id}-${idx}`} 
                  className={`flex flex-wrap gap-1 p-2 rounded-md justify-center ${
                    isWinningCombo 
                    ? 'bg-green-500/20 border border-green-500/50' 
                    : 'bg-muted/40'
                  }`}
                >
                  {combination.numbers
                    .sort((a, b) => a - b)
                    .map((number, nIdx) => {
                      const isNumberHit = drawnNumbersSet.has(number);
                      
                      return (
                        <NumberBadge
                          key={`${player.id}-${idx}-${nIdx}`}
                          number={number}
                          size="sm"
                          isHit={isNumberHit}
                        />
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
