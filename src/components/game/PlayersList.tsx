
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Trophy } from 'lucide-react';
import { Player } from '@/contexts/game/types';
import { NumberBadge } from './NumberBadge';

export interface PlayersListProps {
  players: Player[];
  allDrawnNumbers: number[];
  onEditPlayer: (player: Player) => void;
  currentWinners: Player[];
}

export const PlayersList = ({ players, allDrawnNumbers, onEditPlayer, currentWinners }: PlayersListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra os jogadores pelo nome
  const filteredPlayers = players.filter(player => 
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlayers.map((player) => {
          const playerIsWinner = isWinner(player.id);
          
          return (
            <Card 
              key={player.id} 
              className={`overflow-hidden transition-all ${
                playerIsWinner 
                ? 'border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] bg-green-500/5' 
                : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {playerIsWinner && <Trophy className="h-5 w-5 text-green-500" />}
                      {player.name}
                      {playerIsWinner && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500 text-white flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Vencedor!
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {player.combinations.length} sequências | Acertos máximos: {Math.max(...player.combinations.map(c => c.hits || 0), 0)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditPlayer(player)}
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
                        className={`flex flex-wrap gap-1.5 p-2 rounded-md ${
                          isWinningCombo 
                          ? 'bg-green-500/20 border border-green-500/50' 
                          : 'bg-muted/40'
                        }`}
                      >
                        {combination.numbers.map((number, nIdx) => (
                          <NumberBadge
                            key={`${player.id}-${idx}-${nIdx}`}
                            number={number}
                            size="sm"
                            isHit={allDrawnNumbers.includes(number)}
                          />
                        ))}
                        
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

// Also export as default to maintain compatibility
export default PlayersList;
