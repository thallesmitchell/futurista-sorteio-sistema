
import jsPDF from 'jspdf';
import { generateNearWinnersList } from './near-winners/data-helpers';
import { Game } from '@/contexts/game/types';
import { renderNearWinnersTable } from './near-winners/table-renderer';
import { addNearWinnersSectionHeader } from './near-winners/section-header';
import { PdfSectionOptions } from '../types';

/**
 * Add the near winners section to the PDF if no winners were found
 * 
 * @param doc PDF document
 * @param game Game data
 * @param allDrawnNumbers All drawn numbers
 * @param options Section options
 * @returns Y position after adding the section
 */
export async function addNearWinnersSection(
  doc: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[],
  options: PdfSectionOptions = { color: '#39FF14' }
): Promise<number> {
  try {
    // Generate the list of near winners
    const nearWinnersList = generateNearWinnersList(game, allDrawnNumbers);
    
    // If no near winners, return current position
    if (!nearWinnersList || nearWinnersList.length === 0) {
      return 0;
    }
    
    console.log(`Found ${nearWinnersList.length} near winners for PDF`);
    
    // Add section header
    const headerY = addNearWinnersSectionHeader(doc, options);
    
    // Format the data for the table
    const formattedData: [string, string, string][] = nearWinnersList.map(item => [
      item.player.name,
      item.combinations.map(combo => combo.numbers.join(', ')).join('\n'),
      item.missingHit.toString()
    ]);
    
    // Render table with near winners
    const finalY = await renderNearWinnersTable(doc, formattedData, headerY);
    
    return finalY;
  } catch (error) {
    console.error('Error adding near winners section:', error);
    return 0;
  }
}
