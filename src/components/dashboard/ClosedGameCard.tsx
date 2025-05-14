
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CalendarIcon, Users } from 'lucide-react';
import { Game } from '@/contexts/game/types';
import { useGameWinners } from '@/hooks/useGameWinners';
import GameReport from '@/components/game/GameReport';

interface ClosedGameCardProps {
  game: Game;
}

export const ClosedGameCard: React.FC<ClosedGameCardProps> = ({ game }) => {
  // Use our hook to get winners data
  const { winners } = useGameWinners(game.id, game.players);
  
  return (
    <Card className="overflow-hidden border-muted hover:border-muted/80 transition-colors">
      <div className="p-4 border-b border-muted/10 bg-muted/5 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg opacity-80">{game.name}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              Encerrado em {format(new Date(game.end_date || game.start_date), 'P', { locale: ptBR })}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="bg-muted/20">
          <X className="h-3 w-3 mr-1" /> Encerrado
        </Badge>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <Users className="h-4 w-4 mb-1 opacity-70" />
          <p className="font-medium">{game.players.length}</p>
          <p className="text-xs text-muted-foreground">Jogadores</p>
        </div>
        <div>
          <CalendarIcon className="h-4 w-4 mb-1 opacity-70" />
          <p className="font-medium">{game.dailyDraws.length}</p>
          <p className="text-xs text-muted-foreground">Sorteios</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Link to={`/game/${game.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Visualizar
            </Button>
          </Link>
          <div className="flex-1">
            <GameReport 
              game={game} 
              variant="secondary" 
              size="sm" 
              className="w-full" 
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
