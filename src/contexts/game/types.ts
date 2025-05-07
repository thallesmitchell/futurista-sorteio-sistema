
// Types for game-related data

export interface CombinationWithHits {
  numbers: number[];
  hits: number;
}

export interface Player {
  id: string;
  name: string;
  combinations: CombinationWithHits[];
  hits?: number; // Maintained for backward compatibility
  numbers?: number[]; // Maintained for backward compatibility
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
  endDate: string | null;
  status: 'active' | 'closed';
  players: Player[];
  dailyDraws: DailyDraw[];
  winners: Player[];
  owner_id?: string;
}

// GameContextType is now defined in GameContext.ts, so we remove it from here
