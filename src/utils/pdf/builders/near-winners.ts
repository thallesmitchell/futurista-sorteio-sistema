
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Game, Player } from '@/contexts/game/types';
import { PDFOptions, PdfSectionOptions } from '../types';
import { findNearWinners } from './near-winners/data-helpers';
import { generateNearWinnersTable } from './near-winners/table-renderer';
import { addNearWinnersSectionHeader } from './near-winners/section-header';

/**
 * Add the near winners section to the PDF
 */
export function addNearWinnersSection(doc: jsPDF, game: Game, allDrawnNumbers: number[], options: PdfSectionOptions): number {
  try {
    // If game is closed and has winners, skip near winners section
    if (game.status === 'closed' && game.winners && game.winners.length > 0) {
      console.log('Game is closed and has winners. Skipping near winners section.');
      return 0;
    }
    
    // Find players who are close to winning
    // Updated to use requiredHits - 1 (instead of fixed at 5)
    const requiredHits = game.requiredHits || 6;
    const nearWinHitCount = requiredHits - 1;
    console.log(`Looking for near winners with ${nearWinHitCount} hits (required: ${requiredHits})`);
    
    const nearWinners = findNearWinners(game.players, nearWinHitCount);
    
    if (nearWinners.length === 0) {
      // No near winners found
      return 0;
    }
    
    // Add section header
    addNearWinnersSectionHeader(doc, nearWinHitCount);
    
    // Add the near winners table
    return generateNearWinnersTable(doc, nearWinners, options);
  } catch (error) {
    console.error('Error adding near winners section:', error);
    return 0;
  }
}
