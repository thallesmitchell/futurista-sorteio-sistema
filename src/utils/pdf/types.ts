
import { Game, Player } from '@/contexts/game/types';

export interface GeneratePdfOptions {
  themeColor?: string;
  filename?: string;
  includeNearWinners?: boolean;
}

export interface WinningEntry {
  playerName: string;
  numbers: number[];
}
