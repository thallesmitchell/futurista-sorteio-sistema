
import { ReactNode, useState, useEffect } from 'react';
import GameContext from './GameContext';
import { Game, FinancialProjection } from './types';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
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
    isLoading 
  } = useGameActions(games, setGames);

  const { checkWinners } = useWinnerActions(games, setGames, currentGame, setCurrentGame, recalculatePlayerHits);
  
  const { 
    addPlayer, 
    addPlayerCombination, 
    updatePlayerSequences, 
    updatePlayer 
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

  return (
    <GameContext.Provider value={{
      games,
      currentGame,
      setCurrentGame,
      addGame,
      updateGame,
      deleteGame,
      exportGame,
      importGame,
      addPlayer,
      addPlayerCombination,
      updatePlayer,
      updatePlayerSequences,
      addDailyDraw,
      checkWinners,
      loadFinancialProjections,
      isLoading
    }}>
      {children}
    </GameContext.Provider>
  );
}
