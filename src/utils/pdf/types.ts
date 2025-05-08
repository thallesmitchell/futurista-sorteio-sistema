
import { Game, Player } from '@/contexts/game/types';

/**
 * Options for PDF generation
 */
export interface GeneratePdfOptions {
  /** Theme color for highlights and accents - defaults to green */
  themeColor?: string;
  /** Filename for the generated PDF */
  filename?: string;
  /** Whether to include the near winners section */
  includeNearWinners?: boolean;
}

/**
 * Represents a winning entry in the report
 */
export interface WinningEntry {
  /** Name of the player who won */
  playerName: string;
  /** The winning numbers */
  numbers: number[];
}

/**
 * Options specific to PDF sections
 */
export interface PdfSectionOptions {
  /** Color for highlights and accents */
  color: string;
  /** Max number of combinations to display per player */
  maxCombosPerPlayer?: number;
}
