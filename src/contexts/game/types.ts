
// Types for game-related data

export interface CombinationWithHits {
  numbers: number[];
  hits: number;
}

export interface Player {
  id: string;
  name: string;
  combinations: {
    numbers: number[];
    hits: number;
  }[];
  prize?: number;  // Added for prize amount display
}

export interface DailyDraw {
  id: string;
  date: string;
  numbers: number[];
}

export interface Game {
  id: string;
  name: string;
  startDate: string;
  endDate?: string | null;
  status: 'active' | 'closed';
  players: Player[];
  dailyDraws: DailyDraw[];
  winners: Player[];
  owner_id: string;
  // New game configuration fields
  numbersPerSequence: number;
  requiredHits: number;
  sequencePrice: number;
  adminProfitPercentage: number;
  // Financial projections 
  financialProjections?: {
    totalSequences: number;
    totalCollected: number;
    adminProfit: number;
    totalPrize: number;
  };
}

// GameContextType is now defined in GameContext.ts, so we remove it from here

// Financial projections type
export interface FinancialProjection {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  totalSequences: number;
  sequencePrice: number;
  adminProfitPercentage: number;
  totalCollected: number;
  adminProfit: number;
  totalPrize: number;
}

// Game export/import format
export interface GameExport {
  game: Game;
  players: {
    id: string;
    name: string;
    combinations: {
      numbers: number[];
      hits: number;
    }[];
  }[];
  dailyDraws: DailyDraw[];
  winners: {
    playerId: string;
    combinationId: string;
    prizeAmount?: number;
  }[];
}
