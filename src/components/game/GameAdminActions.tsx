
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';
import { useNavigate } from 'react-router-dom';

interface GameAdminActionsProps {
  gameId: string;
  gameStatus: string;
  onCloseGame: () => void;
}

export const GameAdminActions: React.FC<GameAdminActionsProps> = ({
  gameId,
  gameStatus,
  onCloseGame
}) => {
  const navigate = useNavigate();
  
  if (gameStatus !== 'active') return null;
  
  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
      <Button 
        variant="outline" 
        className="sm:w-auto"
        onClick={onCloseGame}
      >
        <Lock className="mr-2 h-4 w-4" />
        Encerrar Jogo
      </Button>
      
      <DeleteGameButton 
        gameId={gameId} 
        variant="outline"
        className="sm:w-auto"
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
};
