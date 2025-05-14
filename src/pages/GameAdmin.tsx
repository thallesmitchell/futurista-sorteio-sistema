
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Flag, Users, Calendar, Trophy } from 'lucide-react';
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
import { DeleteGameButton } from '@/components/game/DeleteGameButton';
import Confetti from '@/components/game/Confetti';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameWinners } from '@/hooks/useGameWinners';
import { PlayerEditModal } from '@/components/game/PlayerEditModal';

const GameAdmin = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { games, fetchGame, updateGame } = useGame();
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
    return (
      <div className="flex flex-col space-y-4">
        <div className="animate-pulse h-16 bg-muted rounded-lg mb-4" />
        <div className="animate-pulse h-[200px] bg-muted rounded-lg" />
      </div>
    );
  }

  // Game not found
  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Flag className="h-16 w-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Jogo não encontrado</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível encontrar o jogo solicitado.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Voltar para o Dashboard
        </Button>
      </div>
    );
  }

  // Handle closing game (for GameHeader)
  const handleGameClose = () => {
    setIsConfirmCloseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Game Header */}
      <GameHeader
        game={game}
        onCloseGameClick={handleGameClose}
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
      {game.status === 'active' && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
          <Button 
            variant="outline" 
            className="sm:w-auto"
            onClick={() => setIsConfirmCloseModalOpen(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            Encerrar Jogo
          </Button>
          
          <DeleteGameButton 
            gameId={gameId || ''} 
            variant="outline"
            className="sm:w-auto"
            onSuccess={() => navigate('/dashboard')}
          />
        </div>
      )}
      
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
            // Handle player edit save
            if (!gameId || !selectedPlayer) return;
            
            // Create onNewWinnerFound function for PlayerEditHandler
            const onNewWinnerFound = (hasWinners: boolean) => {
              if (hasWinners) {
                setShowConfetti(true);
                setTimeout(() => {
                  setShowConfetti(false);
                  fetchGameData(); // Refresh data to show winners
                }, 5000);
              }
            };
            
            // Use the PlayerEditHandler to handle the save
            const playerEditHandler = new PlayerEditHandler({
              gameId,
              onNewWinnerFound
            });
            
            // Call the handleSavePlayerEdit method
            playerEditHandler.handleSavePlayerEdit();
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
