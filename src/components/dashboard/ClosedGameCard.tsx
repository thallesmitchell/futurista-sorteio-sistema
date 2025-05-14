
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
    <Card className="overflow-hidden border-muted hover:border-muted/80 transition-colors h-full flex flex-col">
      <div className="p-4 md:p-5 border-b border-muted/10 bg-muted/5 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg mb-1 opacity-80">{game.name}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>
              Encerrado em {format(new Date(game.end_date || game.start_date), 'P', { locale: ptBR })}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="bg-muted/20 ml-2 whitespace-nowrap">
          <X className="h-3 w-3 mr-1" /> Encerrado
        </Badge>
      </div>

      <div className="p-4 md:p-5 grid grid-cols-2 gap-4 text-sm flex-grow">
        <div className="flex flex-col items-center md:items-start">
          <Users className="h-4 w-4 mb-2 opacity-70" />
          <p className="font-medium text-base">{game.players.length}</p>
          <p className="text-xs text-muted-foreground">Jogadores</p>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <CalendarIcon className="h-4 w-4 mb-2 opacity-70" />
          <p className="font-medium text-base">{game.dailyDraws.length}</p>
          <p className="text-xs text-muted-foreground">Sorteios</p>
        </div>
      </div>

      <div className="px-4 pb-4 md:px-5 md:pb-5 mt-auto">
        <div className="flex gap-3">
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
