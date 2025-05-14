
// Update existing export, make sure to include Winner and GameContextType
export interface Winner {
  id: string;
  game_id: string;
  player_id: string;
  combination_id: string;
  created_at: string;
  prize_amount?: number;
}

export interface PlayerCombination {
  id?: string;
  numbers: number[];
  hits: number;
}

export interface Player {
  id: string;
  name: string;
  game_id: string;
  combinations: PlayerCombination[];
  created_at?: string;
  prize?: number;
}

export interface DailyDraw {
  id: string;
  game_id: string;
  numbers: number[];
  created_at: string;
  date: string;
}

export interface Game {
  id: string;
  name: string;
  status: 'active' | 'closed' | 'canceled';
  start_date: string;
  end_date?: string;
  owner_id: string;
  players: Player[];
  dailyDraws: DailyDraw[];
  winners: Winner[];
  created_at?: string;
  numbersPerSequence?: number;
  requiredHits?: number;
  sequencePrice?: number;
  adminProfitPercentage?: number;
  totalPlayers?: number;
  totalDraws?: number;
  totalCombinations?: number;
  financialProjections?: GameFinancialProjections;
}

export interface GameFinancialProjections {
  totalSequences?: number;
  totalCollected?: number;
  adminProfit?: number;
  totalPrize?: number;
}

export interface FinancialProjection {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date?: string;
  totalRevenue: number;
  adminProfit: number;
  prizePool: number;
  playerCount: number;
  combinationCount: number;
  averagePayout: number;
  totalSequences?: number;
  sequencePrice?: number;
  adminProfitPercentage?: number;
  totalCollected?: number;
  totalPrize?: number;
  startDate?: string; // Alias for backwards compatibility
  endDate?: string; // Alias for backwards compatibility
}

export interface GameContextType {
  games: Game[];
  currentGame: Game | null;
  setCurrentGame?: (game: Game | null) => void;
  isLoading: boolean;
  fetchGames?: () => Promise<void>;
  fetchGame: (id: string) => Promise<Game | null>;
  addGame: (game: Partial<Game>) => Promise<Game>;
  updateGame: (id: string, game: Partial<Game>) => Promise<boolean>;
  deleteGame: (id: string) => Promise<boolean>;
  addPlayer: (gameId: string, player: Partial<Player>) => Promise<Player>;
  addPlayerCombination?: (
    gameId: string,
    playerId: string,
    numbers: number[]
  ) => Promise<Player>;
  updatePlayer: (player: Player) => Promise<boolean>;
  updatePlayerSequences?: (
    gameId: string,
    playerId: string,
    sequences: number[][]
  ) => Promise<boolean>;
  deletePlayer?: (playerId: string) => Promise<boolean>;
  addDailyDraw: (gameId: string, draw: { date: string; numbers: number[] }) => Promise<DailyDraw>;
  addWinner?: (gameId: string, playerId: string, combinationId: string) => Promise<boolean>;
  checkWinners?: (gameId: string) => Promise<Player[]>;
  getWinners?: (gameId: string) => Promise<Player[]>;
  exportGame: (gameId: string) => Promise<string>;
  importGame: (gameData: string, userId: string) => Promise<Game>;
  loadFinancialProjections?: (game: Game) => Promise<FinancialProjection | null>;
}
