import jsPDF from 'jspdf';
import { Game, Winner } from '@/contexts/game/types';
import { addTableHeader, createSimpleTable } from './utils/pdf-table-utils';
import { PdfSectionOptions } from '../types';

/**
 * Adds the winners section to the PDF
 * @param doc PDF document
 * @param game Game data
 * @param options Section options
 * @returns Y position after adding the section
 */
export function addWinnersSection(
  doc: jsPDF,
  game: Game,
  options: PdfSectionOptions = { color: '#39FF14' }
): number {
  // Check if there are winners
  if (!game.winners || game.winners.length === 0) {
    return 0;
  }
  
  // Add section header
  let currentY = addTableHeader(doc, "Ganhadores", 20, options);
  
  // Format winner data for the table
  const winnerData = game.winners.map((winner, index) => formatWinnerData(winner, index));
  
  // Define table headers
  const headers = ["#", "Nome", "Números", "Prêmio"];
  
  // Create the table
  currentY = createSimpleTable(doc, headers, winnerData, currentY, options);
  
  return currentY;
}

/**
 * Formats the winner data for the table
 * @param winner Winner data
 * @param index Index of the winner
 * @returns Formatted winner data
 */
export function formatWinnerData(winner: Winner, index: number): [string, string, string, string] {
  // Handle different winner data formats
  const winnerName = winner.name || `Ganhador ${index + 1}`;
  
  // Format prize amount with currency
  const prizeAmount = typeof winner.prize === 'number' ? winner.prize : 0;
  const formattedPrize = `R$ ${prizeAmount.toFixed(2).replace('.', ',')}`;
  
  // Get winning numbers - handle different data structures
  let winningNumbers = '';
  
  if (winner.combinations && Array.isArray(winner.combinations)) {
    // Format combinations from array
    winningNumbers = winner.combinations
      .map(combo => combo.numbers.join(', '))
      .join(' | ');
  } else if (typeof winner.combination_id === 'string') {
    // This is a typical winner structure - attempt to get data from game if available
    winningNumbers = winner.combination_id || 'Combinação ganhadora';
  }

  return [
    (index + 1).toString(),
    winnerName,
    winningNumbers,
    formattedPrize
  ];
}
