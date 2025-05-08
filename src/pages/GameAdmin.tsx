
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { Player } from '@/contexts/game/types';
import { GameHeader } from '@/components/game/GameHeader';
import { GameAdminForms } from '@/components/game/GameAdminForms';
import { useToast } from '@/hooks/use-toast';
import PlayerEditHandler from '@/components/game/PlayerEditHandler';
import { GameWinnersSection } from '@/components/game/GameWinnersSection';
import { GameContentTabs } from '@/components/game/GameContentTabs';
import { GameModals } from '@/components/game/GameModals';
import { useGameWinners } from '@/hooks/useGameWinners';

export default function GameAdmin() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, setCurrentGame, updateGame, checkWinners } = useGame();
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const { toast } = useToast();
  const playerEditHandlerRef = useRef<any>(null);

  const game = games.find(g => g.id === gameId);
  const allDrawnNumbers = game?.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];
  
  // Use our new hook to fetch winners directly from the database
  const { winners } = useGameWinners(gameId, game?.players);

  // Set current game for context and check for winners when game data changes
  useEffect(() => {
    if (game) {
      setCurrentGame(game);
      
      if (game.id) {
        console.log('Checking for winners in game:', game.id);
        checkWinners(game.id);
      }
    } else {
      console.log('Game not found, redirecting to dashboard');
      navigate('/dashboard');
    }
    
    return () => {
      setCurrentGame(null);
    };
  }, [game, gameId, navigate, setCurrentGame, checkWinners]);

  // Show 404 if game not found
  if (!game) {
    return null; // Will redirect in useEffect
  }

  // Log for debugging
  console.log('GameAdmin rendering:', { 
    gameId, 
    gameStatus: game.status, 
    hasWinners: winners.length > 0,
    winnersCount: winners.length
  });

  const handleEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    if (playerEditHandlerRef.current?.handleEditPlayer) {
      playerEditHandlerRef.current.handleEditPlayer(player);
    }
  };

  const handleCloseGame = () => {
    updateGame(game.id, {
      status: 'closed',
      endDate: new Date().toISOString()
    });
    setIsCloseModalOpen(false);
  };

  const handleNewWinnerFound = (hasWinners: boolean) => {
    if (hasWinners) {
      setIsWinnersModalOpen(true);
      toast({
        title: "Saiu Ganhador!",
        description: `${winners.length > 1 ? 'Vários jogadores acertaram' : 'Um jogador acertou'} todos os 6 números!`,
        variant: "default",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in table-container">
        {/* Game Header */}
        <GameHeader
          gameId={game.id}
          gameName={game.name}
          startDate={game.startDate}
          playersCount={game.players.length}
          drawsCount={game.dailyDraws.length}
          winners={winners}
          onWinnersClick={() => setIsWinnersModalOpen(true)}
          onCloseGameClick={() => setIsCloseModalOpen(true)}
          showDownloadButton={true}
          game={game}
        />

        {/* Winners Section */}
        <GameWinnersSection 
          winners={winners}
          allDrawnNumbers={allDrawnNumbers}
          isWinnersModalOpen={isWinnersModalOpen}
          setIsWinnersModalOpen={setIsWinnersModalOpen}
        />

        {/* Game Forms */}
        <GameAdminForms 
          gameId={game.id} 
          onNewWinnerFound={handleNewWinnerFound}
        />

        {/* Player Edit Handler */}
        <PlayerEditHandler 
          ref={playerEditHandlerRef}
          gameId={game.id}
          onNewWinnerFound={handleNewWinnerFound}
        />

        {/* Game Content Tabs */}
        <GameContentTabs 
          players={game.players}
          draws={game.dailyDraws || []}
          allDrawnNumbers={allDrawnNumbers}
          onEditPlayer={handleEditPlayer}
          currentWinners={winners}
          gameId={game.id}
        />

        {/* Game Modals */}
        <GameModals 
          isCloseModalOpen={isCloseModalOpen}
          setIsCloseModalOpen={setIsCloseModalOpen}
          onCloseGame={handleCloseGame}
        />
      </div>
    </MainLayout>
  );
}
