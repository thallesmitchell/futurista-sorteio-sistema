
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Player } from '@/contexts/game/types';
import { GameReport } from '@/components/game/GameReport';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameHeaderProps {
  gameId: string;
  gameName: string;
  startDate: string;
  playersCount: number;
  drawsCount: number;
  winners: Player[];
  onWinnersClick: () => void;
  onCloseGameClick: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  gameId,
  gameName,
  startDate,
  playersCount,
  drawsCount,
  winners,
  onWinnersClick,
  onCloseGameClick
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{gameName}</h1>
          
          {winners.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="ml-1 md:ml-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs md:text-sm px-2 py-0.5 h-auto"
              onClick={onWinnersClick}
            >
              <Trophy className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              {winners.length} Ganhador{winners.length !== 1 ? 'es' : ''}
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1 md:mr-2">Criado em:</span>
            <span>{new Date(startDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1 md:mr-2">Jogadores:</span>
            <span>{playersCount}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1 md:mr-2">Sorteios:</span>
            <span>{drawsCount}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
        <GameReport
          game={{
            id: gameId,
            name: gameName,
            startDate,
            players: [], // These are filled in by the GameReport component
            dailyDraws: [], // These are filled in by the GameReport component
            winners: winners,
            status: 'active',
            endDate: null
          }}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className={isMobile ? "text-xs px-2 py-1 h-8" : ""}
        />

        <DeleteGameButton 
          gameId={gameId}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onSuccess={() => navigate('/dashboard')}
        />
        
        <Button 
          variant="destructive" 
          size={isMobile ? "sm" : "default"}
          onClick={onCloseGameClick}
          disabled={winners.length > 0}
          className={isMobile ? "text-xs h-8" : ""}
        >
          {winners.length > 0 ? 'Jogo Encerrado' : 'Encerrar Jogo'}
        </Button>
      </div>
    </div>
  );
};
