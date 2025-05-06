
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Player } from '@/contexts/game/types';
import NumberBadge from './NumberBadge';

export interface PlayersListProps {
  players: Player[];
  allDrawnNumbers: number[];
  onEditPlayer: (player: Player) => void;
  currentWinners: Player[];
}

const PlayersList = ({ players, allDrawnNumbers, onEditPlayer, currentWinners }: PlayersListProps) => {
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
        {filteredPlayers.map((player) => (
          <Card 
            key={player.id} 
            className={`overflow-hidden transition-colors ${
              isWinner(player.id) ? 'border-green-500 dark:border-green-500' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg flex items-center">
                    {player.name}
                    {isWinner(player.id) && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500 text-white">
                        Vencedor
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {player.combinations.length} sequências | Acertos máximos: {Math.max(...player.combinations.map(c => c.hits))}
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
                {player.combinations.map((combination, idx) => (
                  <div key={`${player.id}-${idx}`} className="flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/40">
                    {combination.numbers.map((number, nIdx) => (
                      <NumberBadge
                        key={`${player.id}-${idx}-${nIdx}`}
                        number={number}
                        size="sm"
                        hits={allDrawnNumbers.includes(number) ? 1 : 0}
                      />
                    ))}
                    <span className="ml-auto text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {combination.hits} acertos
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

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
