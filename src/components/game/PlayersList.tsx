
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Trophy } from 'lucide-react';
import { Player } from '@/contexts/game/types';
import { NumberBadge } from './NumberBadge';
import { useIsMobile } from '@/hooks/use-mobile';

export interface PlayersListProps {
  players: Player[];
  allDrawnNumbers: number[];
  onEditPlayer: (player: Player) => void;
  currentWinners: Player[];
}

export const PlayersList = ({ players, allDrawnNumbers, onEditPlayer, currentWinners }: PlayersListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  
  // Ordenar jogadores: vencedores primeiro, depois ordem alfabética
  const sortedPlayers = [...players].sort((a, b) => {
    const aIsWinner = currentWinners.some(winner => winner.id === a.id);
    const bIsWinner = currentWinners.some(winner => winner.id === b.id);
    
    if (aIsWinner && !bIsWinner) return -1;
    if (!aIsWinner && bIsWinner) return 1;
    return a.name.localeCompare(b.name);
  });

  // Filtra os jogadores pelo nome
  const filteredPlayers = sortedPlayers.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verifica se um jogador está na lista de vencedores
  const isWinner = (playerId: string) => {
    return currentWinners.some(winner => winner.id === playerId);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar jogador..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {filteredPlayers.map((player) => {
          const playerIsWinner = isWinner(player.id);
          
          return (
            <Card 
              key={player.id} 
              className={`overflow-hidden transition-all ${
                playerIsWinner 
                ? 'border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] bg-green-500/5 animate-pulse-slow' 
                : ''
              }`}
            >
              <CardContent className={`p-4 ${isMobile ? 'px-3 py-3' : ''}`}>
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <div className="space-y-1">
                    <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} flex items-center gap-2`}>
                      {playerIsWinner && <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-500`} />}
                      {player.name}
                      {playerIsWinner && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500 text-white flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Vencedor!
                        </span>
                      )}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {player.combinations.length} sequência{player.combinations.length !== 1 ? 's' : ''} | 
                      Acertos máximos: {Math.max(...player.combinations.map(c => c.hits), 0)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "default"}
                    onClick={() => onEditPlayer(player)}
                    className={isMobile ? "px-2 py-1 text-xs" : ""}
                  >
                    Editar
                  </Button>
                </div>

                <div className="space-y-2">
                  {player.combinations.map((combination, idx) => {
                    // Verifica se esta é uma combinação vencedora (6 acertos)
                    const isWinningCombo = combination.hits === 6;
                    
                    return (
                      <div 
                        key={`${player.id}-${idx}`} 
                        className={`flex flex-wrap gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-md ${
                          isWinningCombo 
                          ? 'bg-green-500/20 border border-green-500/50 animate-pulse-slow' 
                          : 'bg-muted/40'
                        }`}
                      >
                        {combination.numbers.map((number, nIdx) => {
                          const isNumberHit = allDrawnNumbers.includes(number);
                          
                          return (
                            <NumberBadge
                              key={`${player.id}-${idx}-${nIdx}`}
                              number={number}
                              size={isMobile ? "sm" : "md"}
                              isHit={isNumberHit}
                            />
                          );
                        })}
                        
                        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                          isWinningCombo 
                          ? 'bg-green-500 text-white' 
                          : 'bg-primary/10 text-primary'
                        }`}>
                          {combination.hits} acertos
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredPlayers.length === 0 && (
          <div className="col-span-2 py-8 text-center text-muted-foreground">
            Nenhum jogador encontrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersList;
