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
import { useToast } from '@/components/ui/use-toast';
import PlayerEditHandler from '@/components/game/PlayerEditHandler';
import { GameReport } from '@/components/game/GameReport';

export default function GameAdmin() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, setCurrentGame, updateGame, checkWinners } = useGame();
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const { toast } = useToast();
  const playerEditHandlerRef = useRef<any>(null);

  // Keep track of when we've shown the notification, but not for banner display
  const [hasShownWinnerNotification, setHasShownWinnerNotification] = useState(false);

  const game = games.find(g => g.id === gameId);
  const allDrawnNumbers = game?.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];
  const winners = game?.winners || [];
  const hasWinners = winners.length > 0;

  // Set current game for context and check for winners when game data changes
  useEffect(() => {
    if (game) {
      if (game.status === 'closed') {
        // Redirect to history view if game is closed
        navigate(`/history/${game.id}`);
        return;
      }
      
      setCurrentGame(game);
      
      // Only show toast notification if this is the first time we're seeing winners
      if (hasWinners && !hasShownWinnerNotification) {
        setHasShownWinnerNotification(true);
        setIsWinnersModalOpen(true);
        toast({
          title: "Vencedor Encontrado!",
          description: `${winners.length > 1 ? 'Vários jogadores acertaram' : 'Um jogador acertou'} todos os 6 números!`,
          variant: "default",
        });
      }
    } else {
      // If game not found, redirect to dashboard
      navigate('/dashboard');
    }
    
    // Cleanup on unmount
    return () => {
      setCurrentGame(null);
      setHasShownWinnerNotification(false);
    };
  }, [game, gameId, navigate, setCurrentGame, winners, toast, hasWinners, hasShownWinnerNotification]);

  // Show 404 if game not found
  if (!game || game.status === 'closed') {
    return null; // Will redirect in useEffect
  }

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
        title: "Vencedor Encontrado!",
        description: `${winners.length > 1 ? 'Vários jogadores acertaram' : 'Um jogador acertou'} todos os 6 números!`,
        variant: "default",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Game Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <GameHeader
            gameId={game.id}
            gameName={game.name}
            startDate={game.startDate}
            playersCount={game.players.length}
            drawsCount={game.dailyDraws.length}
            winners={winners}
            onWinnersClick={() => setIsWinnersModalOpen(true)}
            onCloseGameClick={() => setIsCloseModalOpen(true)}
          />
          
          {/* Add Game Report button here for direct access */}
          <GameReport 
            game={game}
            variant="outline"
            size="sm"
          />
        </div>

        {/* Always show the winner banner when there are winners - no conditional state dependency */}
        {hasWinners && (
          <WinnerBanner 
            winners={winners} 
            allDrawnNumbers={allDrawnNumbers}
          />
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
