
/**
 * This file is maintained for backward compatibility
 * All functionality has been moved to the pdf directory
 */

// Import the original functions
import { generateGameReport as originalGenerateGameReport } from './pdfBuilder';
import { generateSimplePdf as originalGenerateSimplePdf } from './simplePdfGenerator';
import { GeneratePdfOptions } from './types';
import { Game } from '@/contexts/game/types';

/**
 * Generate a PDF report for a game
 */
export const generateGameReport = async (game: Game, options: GeneratePdfOptions = {}) => {
  console.log('Starting PDF generation for game:', game.id);
  console.log('Game has winners:', game.winners?.length || 0);
  
  // Ensure we pass hasWinners flag correctly
  const hasWinners = game.winners && game.winners.length > 0;
  console.log('hasWinners flag set to:', hasWinners);
  
  try {
    await originalGenerateGameReport(game, {
      ...options,
      hasWinners,
      // If we have winners, we should not include near winners
      includeNearWinners: options.includeNearWinners && !hasWinners
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate a simple player list PDF
 */
export const generateSimplePdf = async (game: Game, options: GeneratePdfOptions = {}) => {
  try {
    await originalGenerateSimplePdf(game, {
      ...options,
      // Simple PDF is primarily a player list
      simpleMode: true,
      includeNearWinners: options.includeNearWinners ?? true
    });
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw error;
  }
};

// Re-export from builders
export * from './builders';
export * from './types';
