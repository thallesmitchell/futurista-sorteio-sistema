
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Player } from '@/contexts/game/types';
import { GameReport } from '@/components/game/GameReport';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';

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
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{gameName}</h1>
          
          {winners.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="ml-2 bg-primary/10 text-primary hover:bg-primary/20"
              onClick={onWinnersClick}
            >
              <Trophy className="mr-1 h-4 w-4" />
              {winners.length} Ganhador{winners.length !== 1 ? 'es' : ''}
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Criado em:</span>
            <span>{new Date(startDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Jogadores:</span>
            <span>{playersCount}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Sorteios:</span>
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
          size="default"
        />

        <DeleteGameButton 
          gameId={gameId}
          variant="outline"
          size="default"
          onSuccess={() => navigate('/dashboard')}
        />
        
        <Button 
          variant="destructive" 
          onClick={onCloseGameClick}
          disabled={winners.length > 0}
        >
          {winners.length > 0 ? 'Jogo Encerrado' : 'Encerrar Jogo'}
        </Button>
      </div>
    </div>
  );
};
