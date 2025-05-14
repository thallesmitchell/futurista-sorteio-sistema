
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CalendarIcon, Users } from 'lucide-react';
import { Game } from '@/contexts/game/types';
import { useGameWinners } from '@/hooks/useGameWinners';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  // Use our hook to get real-time winners data
  const { winners } = useGameWinners(game.id, game.players);
  const hasWinners = winners && winners.length > 0;
  
  return (
    <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors h-full flex flex-col">
      <div className="p-4 md:p-5 border-b border-primary/10 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg mb-1">{game.name}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>
              Iniciado em {format(new Date(game.start_date), 'P', { locale: ptBR })}
            </span>
          </div>
        </div>
        <Badge variant={hasWinners ? "destructive" : "secondary"} className="ml-2 whitespace-nowrap">
          {hasWinners ? "Tem Ganhador!" : "Ativo"}
        </Badge>
      </div>

      <div className="p-4 md:p-5 grid grid-cols-2 gap-4 text-sm flex-grow">
        <div className="flex flex-col items-center md:items-start">
          <Users className="h-4 w-4 mb-2 text-primary/70" />
          <p className="font-medium text-base">{game.players.length}</p>
          <p className="text-xs text-muted-foreground">Jogadores</p>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <CalendarIcon className="h-4 w-4 mb-2 text-primary/70" />
          <p className="font-medium text-base">{game.dailyDraws.length}</p>
          <p className="text-xs text-muted-foreground">Sorteios</p>
        </div>
      </div>

      <div className="px-4 pb-4 md:px-5 md:pb-5 mt-auto">
        <Link to={`/game/${game.id}`}>
          <Button variant="default" className="w-full gap-2 py-2">
            <span>Gerenciar</span> 
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
