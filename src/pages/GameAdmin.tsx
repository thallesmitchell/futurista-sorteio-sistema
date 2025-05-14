
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { Player, DailyDraw } from '@/contexts/game/types';
import { GameHeader } from '@/components/game/GameHeader';
import { GameContentTabs } from '@/components/game/GameContentTabs';
import { ConfirmCloseModal } from '@/components/game/ConfirmCloseModal';
import { WinnersModal } from '@/components/game/WinnersModal';
import PlayerEditHandler from '@/components/game/PlayerEditHandler';
import { GameAdminForms } from '@/components/game/GameAdminForms';
import { GameFinancialCards } from '@/components/game/GameFinancialCards';
import GameReport from '@/components/game/GameReport';
import { GameWinnersSection } from '@/components/game/GameWinnersSection';
import Confetti from '@/components/game/Confetti';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameWinners } from '@/hooks/useGameWinners';
import { PlayerEditModal } from '@/components/game/PlayerEditModal';
import { GameAdminLoading } from '@/components/game/GameAdminLoading';
import { GameNotFound } from '@/components/game/GameNotFound';
import { GameAdminActions } from '@/components/game/GameAdminActions';

const GameAdmin = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { games, fetchGame, updateGame, checkWinners, updatePlayerSequences } = useGame();
  const { isAuthenticated, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [game, setGame] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allDrawnNumbers, setAllDrawnNumbers] = useState<number[]>([]);
  const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = useState(false);
  const [isShowWinnersModalOpen, setIsShowWinnersModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [editPlayerNumbers, setEditPlayerNumbers] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // Use our hook to get winners directly from the database
  const { winners, isLoading: isLoadingWinners } = useGameWinners(gameId || '', game?.players || []);
  
  // Effect to log when winners are loaded
  useEffect(() => {
    if (winners && winners.length > 0) {
      console.log('Winners loaded from useGameWinners:', winners.length);
    }
  }, [winners]);
  
  const fetchGameData = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      const gameData = await fetchGame(gameId);
      
      if (!gameData) {
        toast({
          title: "Jogo não encontrado",
          description: "Não foi possível encontrar o jogo solicitado.",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }
      
      // Calculate all drawn numbers
      const allNumbers = gameData.dailyDraws?.flatMap((draw: DailyDraw) => 
        Array.isArray(draw.numbers) ? draw.numbers : []
      ) || [];
      
      setAllDrawnNumbers(allNumbers);
      setGame(gameData);
      
      // Show confetti if there are winners and game was just closed
      if (gameData.winners && gameData.winners.length > 0 && gameData.status === 'closed') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do jogo:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os dados do jogo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [gameId, fetchGame, navigate, toast]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchGameData();
    }
  }, [isAuthenticated, fetchGameData]);
  
  const handleCloseGame = async () => {
    if (!gameId || !game) return;
    
    try {
      await updateGame(gameId, { status: 'closed', end_date: new Date().toISOString() });
      toast({
        title: "Jogo encerrado",
        description: "O jogo foi encerrado com sucesso.",
      });
      // Refresh the page and redirect to the dashboard after a small delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error) {
      console.error("Erro ao encerrar jogo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encerrar o jogo.",
        variant: "destructive"
      });
    }
  };
  
  const handlePlayerEdit = (player: Player) => {
    setPlayerToEdit(player);
    
    // Convert player combinations to text format for the textarea
    const playerNumbersText = player.combinations
      .map(combo => combo.numbers.map(n => String(n).padStart(2, '0')).join('-'))
      .join('\n');
      
    setEditPlayerNumbers(playerNumbersText);
    setSelectedPlayer(player);
  };

  // Game not loaded yet
  if (isLoading) {
    return <GameAdminLoading />;
  }

  // Game not found
  if (!game) {
    return <GameNotFound />;
  }

  // Create player edit handler instance
  const playerEditHandler = new PlayerEditHandler({
    gameId: gameId || '',
    onNewWinnerFound: (hasWinners) => {
      if (hasWinners) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          fetchGameData(); // Refresh data to show winners
        }, 5000);
      }
    }
  });
  
  // Set dependencies
  playerEditHandler.setDependencies(toast, updatePlayerSequences, checkWinners);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Game Header */}
      <GameHeader
        game={game}
        onCloseGameClick={() => setIsConfirmCloseModalOpen(true)}
        showCloseButton={true}
      />
      
      {/* Winners Section */}
      {winners && winners.length > 0 && (
        <GameWinnersSection 
          winners={winners}
          allDrawnNumbers={allDrawnNumbers}
          isWinnersModalOpen={isShowWinnersModalOpen}
          setIsWinnersModalOpen={setIsShowWinnersModalOpen}
        />
      )}
      
      {/* Financial Cards */}
      <GameFinancialCards game={game} />
      
      {/* Game Forms (Add Player & Register Draw) */}
      {game.status === 'active' && (
        <GameAdminForms 
          gameId={gameId || ''} 
          onNewWinnerFound={(hasWinners) => {
            if (hasWinners) {
              setShowConfetti(true);
              setTimeout(() => {
                setShowConfetti(false);
                fetchGameData(); // Refresh data to show winners
              }, 5000);
            }
          }}
        />
      )}
      
      {/* Game Content (Players & Draws) */}
      <GameContentTabs
        players={game.players || []}
        draws={game.dailyDraws || []}
        allDrawnNumbers={allDrawnNumbers}
        onEditPlayer={handlePlayerEdit}
        currentWinners={winners || []}
        gameId={gameId || ''}
      />
      
      {/* Game Report Button */}
      <div className="mt-8 flex justify-center">
        <GameReport 
          game={game} 
          variant="default"
          size="lg"
          className="w-full sm:w-auto"
        />
      </div>
      
      {/* Admin Actions */}
      <GameAdminActions 
        gameId={gameId || ''}
        gameStatus={game.status}
        onCloseGame={() => setIsConfirmCloseModalOpen(true)}
      />
      
      {/* Player Edit Modal */}
      {selectedPlayer && (
        <PlayerEditModal
          isOpen={!!selectedPlayer}
          setIsOpen={() => setSelectedPlayer(null)}
          player={selectedPlayer}
          gameId={gameId || ''}
          editPlayerNumbers={editPlayerNumbers}
          setEditPlayerNumbers={setEditPlayerNumbers}
          onSave={() => {
            if (!selectedPlayer) return;
            playerEditHandler.handleSavePlayerEdit(selectedPlayer, editPlayerNumbers)
              .then(success => {
                if (success) {
                  setSelectedPlayer(null);
                }
              });
          }}
        />
      )}
      
      {/* Confirm Close Modal */}
      <ConfirmCloseModal 
        isOpen={isConfirmCloseModalOpen}
        setIsOpen={setIsConfirmCloseModalOpen}
        onConfirm={handleCloseGame}
      />
      
      {/* Winners Modal */}
      <WinnersModal 
        isOpen={isShowWinnersModalOpen}
        setIsOpen={setIsShowWinnersModalOpen}
        winners={winners || []}
        allDrawnNumbers={allDrawnNumbers}
        onClose={() => setIsShowWinnersModalOpen(false)}
      />
      
      {/* Confetti effect for winners */}
      {showConfetti && <Confetti />}
    </div>
  );
};

export default GameAdmin;
