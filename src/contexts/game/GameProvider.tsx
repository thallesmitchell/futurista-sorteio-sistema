
import { ReactNode, useState, useEffect } from 'react';
import GameContext from './GameContext';
import { Game, Player, FinancialProjection } from './types';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useGameActions } from './hooks/useGameActions';
import { useWinnerActions } from './hooks/useWinnerActions';
import { usePlayerActions } from './hooks/usePlayerActions';
import { useDrawActions } from './hooks/useDrawActions';

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Initialize hooks with shared state
  const { 
    addGame, 
    updateGame, 
    deleteGame, 
    loadGamesFromSupabase, 
    recalculatePlayerHits,
    exportGame,
    importGame,
    loadFinancialProjections,
    fetchGame,
    isLoading 
  } = useGameActions(games, setGames);

  const { checkWinners, addWinner, getWinners } = useWinnerActions(games, setGames, currentGame, setCurrentGame, recalculatePlayerHits);
  
  const { 
    addPlayer, 
    addPlayerCombination, 
    updatePlayerSequences, 
    updatePlayer,
    deletePlayer 
  } = usePlayerActions(games, setGames, currentGame, setCurrentGame, checkWinners);

  const { addDailyDraw } = useDrawActions(
    games, 
    setGames, 
    currentGame, 
    setCurrentGame, 
    recalculatePlayerHits,
    checkWinners
  );

  // Load games from Supabase when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadGamesFromSupabase();
    } else {
      setGames([]);
      setCurrentGame(null);
    }
  }, [isAuthenticated, user]);

  // Wrap async functions to return boolean for success/failure as required by the types
  const wrappedUpdateGame = async (id: string, gameUpdates: Partial<Game>): Promise<boolean> => {
    try {
      await updateGame(id, gameUpdates);
      return true;
    } catch (error) {
      return false;
    }
  };

  const wrappedUpdatePlayer = async (player: Player): Promise<boolean> => {
    try {
      await updatePlayer(player.game_id, player.id, player);
      return true;
    } catch (error) {
      return false;
    }
  };

  const wrappedAddPlayerCombination = async (gameId: string, playerId: string, numbers: number[]) => {
    try {
      await addPlayerCombination(gameId, playerId, numbers);
      // Find the updated player and return it
      const game = games.find(g => g.id === gameId);
      const player = game?.players.find(p => p.id === playerId);
      return player || {
        id: '',
        name: '',
        game_id: '',
        combinations: []
      };
    } catch (error) {
      return {
        id: '',
        name: '',
        game_id: '',
        combinations: []
      };
    }
  };

  const wrappedUpdatePlayerSequences = async (gameId: string, playerId: string, sequences: number[][]): Promise<boolean> => {
    try {
      await updatePlayerSequences(gameId, playerId, sequences);
      return true;
    } catch (error) {
      return false;
    }
  };

  const wrappedDeletePlayer = async (playerId: string): Promise<boolean> => {
    try {
      return await deletePlayer(playerId);
    } catch (error) {
      return false;
    }
  };

  const wrappedLoadFinancialProjections = async (game: Game): Promise<FinancialProjection | null> => {
    try {
      const projections = await loadFinancialProjections(game.start_date, game.end_date);
      return projections[0] || null;
    } catch (error) {
      return null;
    }
  };

  return (
    <GameContext.Provider value={{
      games,
      currentGame,
      setCurrentGame,
      fetchGame,
      addGame,
      updateGame: wrappedUpdateGame,
      deleteGame,
      exportGame,
      importGame,
      addPlayer,
      addPlayerCombination: wrappedAddPlayerCombination,
      updatePlayer: wrappedUpdatePlayer,
      updatePlayerSequences: wrappedUpdatePlayerSequences,
      addDailyDraw,
      checkWinners,
      addWinner,
      getWinners,
      deletePlayer: wrappedDeletePlayer,
      loadFinancialProjections: wrappedLoadFinancialProjections,
      isLoading
    }}>
      {children}
    </GameContext.Provider>
  );
}
