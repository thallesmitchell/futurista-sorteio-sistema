
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Trophy, Eye, Pencil } from 'lucide-react';
import { Player } from '@/contexts/game/types';
import { NumberBadge } from './NumberBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { DeletePlayerButton } from './DeletePlayerButton';

export interface PlayersListProps {
  players: Player[];
  allDrawnNumbers: number[];
  onEditPlayer: (player: Player) => void;
  currentWinners: Player[];
  gameId?: string;
}

export const PlayersList = ({ players, allDrawnNumbers, onEditPlayer, currentWinners, gameId }: PlayersListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  
  // Memoize sorted players for better performance
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aIsWinner = currentWinners.some(winner => winner.id === a.id);
      const bIsWinner = currentWinners.some(winner => winner.id === b.id);
      
      if (aIsWinner && !bIsWinner) return -1;
      if (!aIsWinner && bIsWinner) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [players, currentWinners]);

  // Memoize filtered players for better performance
  const filteredPlayers = useMemo(() => {
    return sortedPlayers.filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedPlayers, searchTerm]);

  // Memoized function to check if a player is a winner
  const isWinner = useMemo(() => {
    const winnerIds = new Set(currentWinners.map(winner => winner.id));
    return (playerId: string) => winnerIds.has(playerId);
  }, [currentWinners]);

  // Memoize all drawn numbers set for faster lookup
  const drawnNumbersSet = useMemo(() => {
    return new Set(allDrawnNumbers);
  }, [allDrawnNumbers]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar jogador..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {gameId && (
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            asChild
          >
            <Link to={`/game/players/${gameId}`}>
              <Eye className="mr-1 h-4 w-4" />
              Ver Jogadas
            </Link>
          </Button>
        )}
      </div>

      {/* Changed to masonry layout using CSS columns - responsive */}
      <div className="columns-1 xs:columns-2 md:columns-3 gap-4 space-y-0 w-full overflow-x-hidden">
        {filteredPlayers.map((player) => {
          const playerIsWinner = isWinner(player.id);
          
          return (
            <Card 
              key={player.id} 
              className={`mb-4 inline-block w-full overflow-hidden break-inside-avoid ${
                playerIsWinner 
                ? 'border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] bg-green-500/5' 
                : ''
              }`}
            >
              <CardContent className={`p-4 ${isMobile ? 'px-3 py-3' : ''}`}>
                <div className="flex justify-between items-center mb-3 md:mb-4 flex-wrap gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} flex items-center gap-2 flex-wrap`}>
                      {playerIsWinner && <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-500 flex-shrink-0`} />}
                      <span className="truncate">{player.name}</span>
                      {playerIsWinner && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-green-500 text-white flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Vencedor!
                        </span>
                      )}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {player.combinations.length} sequência{player.combinations.length !== 1 ? 's' : ''} | 
                      Acertos máximos: {Math.max(...player.combinations.map(c => c.hits), 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size={isMobile ? "sm" : "default"}
                      onClick={() => onEditPlayer(player)}
                      className={isMobile ? "px-3 py-1 text-xs flex-shrink-0" : "flex-shrink-0"}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                    
                    <DeletePlayerButton
                      playerId={player.id}
                      gameId={gameId || ''}
                      playerName={player.name}
                      size={isMobile ? "sm" : "default"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {player.combinations.map((combination, idx) => {
                    // Verifica se esta é uma combinação vencedora (6 acertos)
                    const isWinningCombo = combination.hits === 6;
                    
                    return (
                      <div 
                        key={`${player.id}-${idx}`} 
                        className={`flex flex-wrap gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-md justify-center ${
                          isWinningCombo 
                          ? 'bg-green-500/20 border border-green-500/50 animate-pulse-slow' 
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
                                size={isMobile ? "sm" : "md"}
                                isHit={isNumberHit}
                              />
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredPlayers.length === 0 && (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            Nenhum jogador encontrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersList;
