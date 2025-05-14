
/**
 * Main PDF generator exports
 */
import { Game } from '@/contexts/game/types';
import { GeneratePdfOptions } from './types';
import { generateGameReport as generateGameReportImpl } from './pdfBuilder';
import { generateSimplePdf as generateSimplePdfImpl } from './simplePdfGenerator';

/**
 * Generate a PDF report for a game
 * This is a wrapper around the implementation in pdfBuilder.ts
 */
export const generateGameReport = async (game: Game, options: GeneratePdfOptions = {}) => {
  console.log('Starting PDF generation for game:', game.id);
  console.log('Game has winners:', game.winners?.length || 0);
  
  // Ensure we pass hasWinners flag correctly
  const hasWinners = game.winners && game.winners.length > 0;
  console.log('hasWinners flag set to:', hasWinners);
  
  try {
    await generateGameReportImpl(game, {
      ...options,
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
 * This is a wrapper around the implementation in simplePdfGenerator.ts
 */
export const generateSimplePdf = async (game: Game, options: GeneratePdfOptions = {}) => {
  try {
    await generateSimplePdfImpl(game, {
      ...options,
      // Simple PDF is primarily a player list
      includeWinners: false,
      includeNearWinners: true,
      simpleMode: true
    });
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw error;
  }
};

// Re-export other utility functions
export * from './types';
export { PDF_CONFIG } from './builders/base-pdf';
