
import { Game, Player } from '@/contexts/game/types';

export interface GeneratePdfOptions {
  themeColor?: string;
}

export interface WinningEntry {
  playerName: string;
  numbers: number[];
}
