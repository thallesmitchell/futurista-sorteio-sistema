
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { GameAdminForms } from '@/components/game/GameAdminForms';
import { GameHeader } from '@/components/game/GameHeader';
import { GameContentTabs } from '@/components/game/GameContentTabs';
import { PlayerEditHandler } from '@/components/game/PlayerEditHandler';
import { Player } from '@/contexts/game/types';
import { ConfirmCloseModal } from '@/components/game/ConfirmCloseModal';
import { WinnersModal } from '@/components/game/WinnersModal';
import { WinnerBanner } from '@/components/game/WinnerBanner';
import { GameOptionsMenu } from '@/components/game/GameOptionsMenu';
import { GameFinancialCards } from '@/components/game/GameFinancialCards'; 
import { useGameWinners } from '@/hooks/useGameWinners';

const GameAdmin = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, setCurrentGame, updateGame } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);
  const [hasNewWinner, setHasNewWinner] = useState(false);
  
  // Use our hook to get winners directly from database
  const { winners } = useGameWinners(gameId, games.find(g => g.id === gameId)?.players);
  
  const game = games.find(g => g.id === gameId);
  
  // Set the current game when loaded
  useEffect(() => {
    if (game) {
      setCurrentGame(game);
    }
    
    // When unmounting, clear current game
    return () => {
      setCurrentGame(null);
    };
  }, [game, setCurrentGame]);
  
  // Redirect if game not found
  useEffect(() => {
    if (games.length > 0 && !game) {
      navigate('/dashboard');
    }
  }, [game, games.length, navigate]);
  
  if (!game) {
    return (
      <div className="container p-4">
        <p>Carregando jogo...</p>
      </div>
    );
  }
  
  // All drawn numbers for highlighting
  const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
  
  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
  };
  
  const handleCloseGame = async () => {
    // Close the game and navigate back to dashboard with a full page reload
    await updateGame(game.id, { 
      status: 'closed',
      endDate: new Date().toISOString()
    });
    
    // Force a full page reload and navigate to dashboard
    window.location.href = '/dashboard';
  };
  
  const handleWinnersClick = () => {
    setIsWinnersModalOpen(true);
  };
  
  const handleNewWinnerFound = (hasWinners: boolean) => {
    setHasNewWinner(hasWinners);
  };
  
  return (
    <div className="container p-4 space-y-6">
      <div className="flex items-center justify-between">
        <GameHeader 
          gameId={game.id}
          gameName={game.name}
          startDate={game.startDate}
          playersCount={game.players.length}
          drawsCount={game.dailyDraws.length}
          winners={winners || []}
          onWinnersClick={handleWinnersClick}
          onCloseGameClick={() => setIsCloseModalOpen(true)}
          showDownloadButton={true}
          game={game}
        />
        <GameOptionsMenu gameId={game.id} />
      </div>
      
      {/* Financial Cards */}
      <GameFinancialCards game={game} />
      
      {/* Winner Banner */}
      {winners && winners.length > 0 && (
        <WinnerBanner winners={winners} allDrawnNumbers={allDrawnNumbers} />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GameContentTabs 
            players={game.players}
            draws={game.dailyDraws}
            allDrawnNumbers={allDrawnNumbers}
            onEditPlayer={handleEditPlayer}
            currentWinners={winners || []}
            gameId={game.id}
          />
        </div>
        
        <div>
          <GameAdminForms gameId={game.id} onNewWinnerFound={handleNewWinnerFound} />
        </div>
      </div>
      
      {/* Modals */}
      <PlayerEditHandler 
        player={selectedPlayer} 
        onClose={() => setSelectedPlayer(null)} 
      />
      
      <ConfirmCloseModal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)} 
        onConfirm={handleCloseGame} 
      />
      
      <WinnersModal 
        isOpen={isWinnersModalOpen} 
        onClose={() => setIsWinnersModalOpen(false)} 
        winners={winners || []}
        gameId={game.id}
      />
    </div>
  );
};

export default GameAdmin;
