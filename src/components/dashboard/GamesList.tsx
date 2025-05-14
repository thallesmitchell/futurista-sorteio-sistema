
import React from 'react';
import { Button } from '@/components/ui/button';
import { Game } from '@/contexts/game/types';
import { GameCard } from './GameCard';
import { ClosedGameCard } from './ClosedGameCard';

interface GamesListProps {
  games: Game[];
  status: 'active' | 'closed';
  onCreateGame: () => void;
}

export const GamesList: React.FC<GamesListProps> = ({ 
  games, 
  status, 
  onCreateGame 
}) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg my-4">
        <p className="text-muted-foreground mb-3">
          {status === 'active' 
            ? 'Nenhum jogo ativo encontrado' 
            : 'Nenhum jogo encerrado encontrado'
          }
        </p>
        {status === 'active' && (
          <Button 
            variant="link" 
            className="mt-2" 
            onClick={onCreateGame}
          >
            Crie um novo jogo
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {status === 'active'
        ? games.map(game => <GameCard key={game.id} game={game} />)
        : games.map(game => <ClosedGameCard key={game.id} game={game} />)
      }
    </div>
  );
};
