
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
    <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors">
      <div className="p-4 border-b border-primary/10 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg">{game.name}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              Iniciado em {format(new Date(game.start_date), 'P', { locale: ptBR })}
            </span>
          </div>
        </div>
        <Badge variant={hasWinners ? "destructive" : "secondary"}>
          {hasWinners ? "Tem Ganhador!" : "Ativo"}
        </Badge>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <Users className="h-4 w-4 mb-1 text-primary/70" />
          <p className="font-medium">{game.players.length}</p>
          <p className="text-xs text-muted-foreground">Jogadores</p>
        </div>
        <div>
          <CalendarIcon className="h-4 w-4 mb-1 text-primary/70" />
          <p className="font-medium">{game.dailyDraws.length}</p>
          <p className="text-xs text-muted-foreground">Sorteios</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Link to={`/game/${game.id}`}>
          <Button variant="default" className="w-full gap-2">
            <span>Gerenciar</span> 
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
