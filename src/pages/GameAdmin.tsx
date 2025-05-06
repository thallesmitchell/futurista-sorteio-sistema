
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { TabsController } from '@/components/game/TabsController';
import { TabsContent } from '@/components/ui/tabs';
import DrawsList from '@/components/game/DrawsList';
import PlayersList from '@/components/game/PlayersList';
import { WinnersModal } from '@/components/game/WinnersModal';
import { ConfirmCloseModal } from '@/components/game/ConfirmCloseModal';
import { Player } from '@/contexts/game/types';
import { GameHeader } from '@/components/game/GameHeader';
import { GameAdminForms } from '@/components/game/GameAdminForms';
import { useToast } from '@/components/ui/use-toast';

export default function GameAdmin() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, setCurrentGame, updateGame, checkWinners } = useGame();
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [newWinnerFound, setNewWinnerFound] = useState(false);
  const { toast } = useToast();
  const playerEditHandlerRef = useRef<any>(null);

  const game = games.find(g => g.id === gameId);
  const allDrawnNumbers = game?.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];
  const winners = game?.winners || [];

  // Set current game for context and check for newly found winners
  useEffect(() => {
    if (game) {
      if (game.status === 'closed') {
        // Redirect to history view if game is closed
        navigate(`/history/${game.id}`);
        return;
      }
      setCurrentGame(game);
      
      // Check for new winners that haven't been notified yet
      if (winners.length > 0 && !newWinnerFound) {
        setNewWinnerFound(true);
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
    };
  }, [game, gameId, navigate, setCurrentGame, winners, newWinnerFound, toast]);

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
      setNewWinnerFound(true);
      setIsWinnersModalOpen(true);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
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
        />

        {/* Game Forms */}
        <GameAdminForms gameId={game.id} />

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
        onClose={() => setIsWinnersModalOpen(false)}
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
