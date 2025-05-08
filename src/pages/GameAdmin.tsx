
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { TabsController } from '@/components/game/TabsController';
import { TabsContent } from '@/components/ui/tabs';
import DrawsList from '@/components/game/DrawsList';
import PlayersList from '@/components/game/PlayersList';
import { WinnersModal } from '@/components/game/WinnersModal';
import { WinnerBanner } from '@/components/game/WinnerBanner';
import { ConfirmCloseModal } from '@/components/game/ConfirmCloseModal';
import { Player } from '@/contexts/game/types';
import { GameHeader } from '@/components/game/GameHeader';
import { GameAdminForms } from '@/components/game/GameAdminForms';
import { useToast } from '@/hooks/use-toast';
import PlayerEditHandler from '@/components/game/PlayerEditHandler';

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
  const winners = game?.winners || [];
  const hasWinners = winners.length > 0;

  // Set current game for context and check for winners when game data changes
  useEffect(() => {
    if (game) {
      // IMPORTANT: Only redirect to history if game is closed AND has no winners
      // This ensures games with winners stay on the admin page regardless of status
      if (game.status === 'closed' && !hasWinners) {
        console.log('Game is closed and has no winners, redirecting to history view');
        navigate(`/history/${game.id}`);
        return;
      }
      
      setCurrentGame(game);
      
      // Check for winners when game data changes
      if (game.id && !game.winners?.length) {
        console.log('Checking for winners in game:', game.id);
        checkWinners(game.id);
      }
    } else {
      // If game not found, redirect to dashboard
      console.log('Game not found, redirecting to dashboard');
      navigate('/dashboard');
    }
    
    // Cleanup on unmount
    return () => {
      setCurrentGame(null);
    };
  }, [game, gameId, navigate, setCurrentGame, checkWinners, hasWinners]);

  // Show 404 if game not found
  if (!game) {
    return null; // Will redirect in useEffect
  }

  // Log for debugging
  console.log('GameAdmin rendering:', { 
    gameId, 
    gameStatus: game.status, 
    hasWinners,
    winnersCount: winners.length
  });

  const handleEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    // Using useRef to access the component's method
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
    // Redirect to history view
    navigate(`/history/${game.id}`);
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

        {/* Sempre mostrar o banner de vencedor quando houver ganhadores */}
        {hasWinners && (
          <div className="permanent-winner-banner">
            <WinnerBanner 
              winners={winners} 
              allDrawnNumbers={allDrawnNumbers}
            />
          </div>
        )}

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

        {/* Game Content */}
        <TabsController defaultValue="players">
          <TabsContent value="players">
            <PlayersList 
              players={game.players} 
              allDrawnNumbers={allDrawnNumbers}
              onEditPlayer={handleEditPlayer}
              currentWinners={winners}
              gameId={game.id} // Pass gameId to PlayersList
            />
          </TabsContent>
          
          <TabsContent value="draws">
            <DrawsList 
              draws={game.dailyDraws || []}
              isReadOnly={false}
            />
          </TabsContent>
        </TabsController>
      </div>

      {/* Winners Modal */}
      <WinnersModal 
        isOpen={isWinnersModalOpen}
        setIsOpen={setIsWinnersModalOpen}
        winners={winners}
        allDrawnNumbers={allDrawnNumbers}
        onClose={() => {
          setIsWinnersModalOpen(false);
        }}
      />

      {/* Confirm Close Modal */}
      <ConfirmCloseModal 
        isOpen={isCloseModalOpen}
        setIsOpen={setIsCloseModalOpen}
        onConfirm={handleCloseGame}
      />
    </MainLayout>
  );
}
