
import { createContext, useContext } from 'react';
import { Game, Player, DailyDraw, FinancialProjection } from './types';

// Define more granular context types for improved type safety
interface GameStateContext {
  games: Game[];
  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
}

interface GameActionsContext {
  // Game actions
  addGame: (game: Omit<Game, 'id'>) => Promise<Game>;
  updateGame: (id: string, game: Partial<Game>) => Promise<void>;
  deleteGame: (id: string) => Promise<boolean>;
  exportGame: (id: string) => Promise<string>;
  importGame: (jsonData: string, ownerId: string) => Promise<Game>;
  
  // Player actions
  addPlayer: (gameId: string, player: Omit<Player, 'id'>) => Promise<Player | undefined>;
  addPlayerCombination: (gameId: string, playerId: string, numbers: number[]) => Promise<void>;
  updatePlayer: (gameId: string, playerId: string, player: Partial<Player>) => Promise<void>;
  updatePlayerSequences: (gameId: string, playerId: string, sequences: number[][]) => Promise<void>;
  
  // Draw actions
  addDailyDraw: (gameId: string, draw: Omit<DailyDraw, 'id'>) => Promise<DailyDraw | undefined>;
  
  // Winner actions
  checkWinners: (gameId: string) => Promise<Player[]>;
  
  // Financial actions
  loadFinancialProjections: (startDate?: string, endDate?: string) => Promise<FinancialProjection[]>;
}

// Combined interface for the full context
export interface GameContextType extends GameStateContext, GameActionsContext {}

// Create the context
export const GameContext = createContext<GameContextType | undefined>(undefined);

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Convenience hooks for specific parts of the context
// These can be used when components only need access to specific parts
export const useGameState = (): GameStateContext => {
  const { games, currentGame, setCurrentGame } = useGame();
  return { games, currentGame, setCurrentGame };
};

export const useGameActions = (): GameActionsContext => {
  const { 
    addGame, updateGame, deleteGame, exportGame, importGame,
    addPlayer, addPlayerCombination, updatePlayer, updatePlayerSequences,
    addDailyDraw, checkWinners, loadFinancialProjections
  } = useGame();
  
  return {
    addGame, updateGame, deleteGame, exportGame, importGame,
    addPlayer, addPlayerCombination, updatePlayer, updatePlayerSequences,
    addDailyDraw, checkWinners, loadFinancialProjections
  };
};
