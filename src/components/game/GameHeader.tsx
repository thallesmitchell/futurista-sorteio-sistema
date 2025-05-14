
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, Trophy, XSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Player, Game } from '@/contexts/game/types';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { GameReport } from './GameReport';

interface GameHeaderProps {
  gameId?: string;
  gameName?: string;
  startDate?: string;
  playersCount?: number;
  drawsCount?: number;
  winners?: Player[];
  onWinnersClick?: () => void;
  onCloseGameClick?: () => void;
  showDownloadButton?: boolean;
  game?: Game;
  showCloseButton?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  gameId,
  gameName,
  startDate,
  playersCount,
  drawsCount,
  winners,
  onWinnersClick,
  onCloseGameClick,
  showDownloadButton = false,
  game,
  showCloseButton = false
}) => {
  const isMobile = useIsMobile();
  const hasWinners = winners && winners.length > 0;
  
  // Format the start date if available
  const formattedDate = startDate ? formatDistanceToNow(new Date(startDate), {
    addSuffix: true,
    locale: ptBR
  }) : '';
  
  // Extract values from game object if provided
  const displayGameId = gameId || game?.id || '';
  const displayGameName = gameName || game?.name || '';
  const displayPlayersCount = playersCount || (game?.players?.length || 0);
  const displayDrawsCount = drawsCount || (game?.dailyDraws?.length || 0);
  const displayStartDate = startDate || game?.start_date || '';
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 w-full">
      <div className="space-y-1 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <h2 className="text-xl md:text-2xl font-bold leading-none tracking-tight truncate">
            {displayGameName}
          </h2>
          <Badge variant="outline" className="text-xs">
            ID: {displayGameId.substring(0, 8)}
          </Badge>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
          {displayStartDate && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {isMobile ? 'Início: ' : 'Iniciado '}
              {formattedDate}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {displayPlayersCount} {displayPlayersCount === 1 ? 'jogador' : 'jogadores'}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {displayDrawsCount} {displayDrawsCount === 1 ? 'sorteio' : 'sorteios'}
          </span>
          {hasWinners && onWinnersClick && (
            <Badge 
              className="bg-green-500 hover:bg-green-600 cursor-pointer animate-pulse-slow flex items-center gap-1"
              onClick={onWinnersClick}
            >
              <Trophy className="h-3 w-3" />
              {winners.length} {winners.length === 1 ? 'vencedor' : 'vencedores'}
            </Badge>
          )}
        </p>
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
        {showDownloadButton && game && (
          <GameReport game={game} variant="outline" size="sm" />
        )}
        
        {showCloseButton && onCloseGameClick && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onCloseGameClick}
          >
            <XSquare className="h-4 w-4 mr-2" />
            Encerrar Jogo
          </Button>
        )}
      </div>
    </div>
  );
};
