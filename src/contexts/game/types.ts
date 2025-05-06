
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

export interface GameContextType {
  games: Game[];
  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
  addGame: (game: Omit<Game, 'id'>) => Promise<Game>; // Atualizado para Promise
  updateGame: (id: string, game: Partial<Game>) => Promise<void>; // Atualizado para Promise
  deleteGame: (id: string) => Promise<boolean>; // Atualizado para Promise
  addPlayer: (gameId: string, player: Omit<Player, 'id'>) => Promise<Player | undefined>; // Atualizado para Promise
  addPlayerCombination: (gameId: string, playerId: string, numbers: number[]) => Promise<void>; // Atualizado para Promise
  updatePlayer: (gameId: string, playerId: string, player: Partial<Player>) => Promise<void>; // Atualizado para Promise
  updatePlayerSequences: (gameId: string, playerId: string, sequences: number[][]) => Promise<void>; // Nova função
  addDailyDraw: (gameId: string, draw: Omit<DailyDraw, 'id'>) => Promise<DailyDraw | undefined>; // Atualizado para Promise
  checkWinners: (gameId: string) => Promise<Player[]>; // Atualizado para Promise
}
