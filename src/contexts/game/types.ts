
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
}

export interface GameContextType {
  games: Game[];
  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
  addGame: (game: Omit<Game, 'id'>) => Game;
  updateGame: (id: string, game: Partial<Game>) => void;
  deleteGame: (id: string) => boolean;
  addPlayer: (gameId: string, player: Omit<Player, 'id'>) => void;
  addPlayerCombination: (gameId: string, playerId: string, numbers: number[]) => void;
  updatePlayer: (gameId: string, playerId: string, player: Partial<Player>) => void;
  addDailyDraw: (gameId: string, draw: Omit<DailyDraw, 'id'>) => void;
  checkWinners: (gameId: string) => Player[];
}
