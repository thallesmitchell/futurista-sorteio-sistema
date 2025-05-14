
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
  /** Trophy SVG data for rendering */
  trophySvgData?: string;
  /** Whether winners are included */
  hasWinners?: boolean;
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
  /** Title for the section */
  title?: string;
  /** Starting Y position */
  startY?: number;
}

/**
 * Options for PDF generation with full features
 * Used by both PDF generators
 */
export interface PDFOptions {
  /** Theme color for highlights and accents */
  color?: string;
  /** Whether to include winners section */
  includeWinners?: boolean;
  /** Whether to include near winners section */
  includeNearWinners?: boolean;
  /** Whether this is a simple mode PDF (player list only) */
  simpleMode?: boolean;
  /** Trophy SVG data for rendering */
  trophySvgData?: string;
}
