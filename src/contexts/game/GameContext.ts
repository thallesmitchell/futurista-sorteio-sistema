
import { createContext } from 'react';
import { Game, Player, DailyDraw, Winner, GameContextType } from './types';

// Create GameContext with initial empty state
const GameContext = createContext<GameContextType>({
  games: [],
  currentGame: null,
  isLoading: false,
  fetchGames: async () => {},
  fetchGame: async (id: string) => null,
  addGame: async (game: Partial<Game>) => ({ id: '', name: '', status: 'active', start_date: '', owner_id: '' }),
  updateGame: async (id: string, game: Partial<Game>) => false,
  deleteGame: async (id: string) => false,
  addPlayer: async (gameId: string, player: Partial<Player>) => ({ id: '', name: '', game_id: '' }),
  updatePlayer: async (player: Player) => false,
  deletePlayer: async (playerId: string) => false,
  addDailyDraw: async (gameId: string, numbers: number[]) => ({ id: '', game_id: '', numbers: [], created_at: '', date: '' }),
  addWinner: async (gameId: string, playerId: string, combinationId: string) => false,
  getWinners: async (gameId: string) => [],
  exportGame: async (gameId: string) => '{}',
  importGame: async (gameData: string, userId: string) => ({ id: '', name: '', status: 'active', start_date: '', owner_id: '' }),
});

export default GameContext;
