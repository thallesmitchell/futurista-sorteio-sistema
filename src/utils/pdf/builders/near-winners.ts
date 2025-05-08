
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import { PdfSectionOptions } from '../types';
import { findNearWinners, createNearWinnersTableData } from './near-winners/data-helpers';
import { drawNearWinnersHeader } from './near-winners/section-header';
import { generateNearWinnersTable } from './near-winners/table-renderer';

// Main function that adds the near winners section to the PDF
export const addNearWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  options: PdfSectionOptions = { color: '#39FF14' }
): number => {
  try {
    if (!game) {
      console.error('Invalid game data provided to addNearWinnersSection');
      return PDF_CONFIG.margin + 30;
    }

    console.log('Starting near winners section processing');
    
    // Create a set of drawn numbers for faster lookup
    const drawnNumbersSet = new Set(allDrawnNumbers);
    console.log(`Total drawn numbers: ${drawnNumbersSet.size}`);
    console.log(`Drawn numbers: ${[...drawnNumbersSet].join(', ')}`);
    
    // Find players with combinations that have exactly 5 hits
    const nearWinners = findNearWinners(game);
    console.log(`Found ${nearWinners.length} players with near-winning combinations`);
      
    // If no near winners, return current position
    if (nearWinners.length === 0) {
      console.log('No near winners found, skipping section');
      return PDF_CONFIG.margin + 30;
    }
    
    // Draw section header
    const currentY = drawNearWinnersHeader(pdf, options);
    
    // Create table data from near winners
    const tableData = createNearWinnersTableData(nearWinners, drawnNumbersSet);
    console.log(`Generated ${tableData.length} rows for near winners table`);
    
    if (tableData.length === 0) {
      console.log('No table data generated, skipping section');
      return currentY + 10;
    }
    
    // Generate table and return final Y position
    const finalY = generateNearWinnersTable(pdf, tableData, currentY);
    console.log(`Table rendered successfully, new Y position: ${finalY}`);
    return finalY;
  } catch (error) {
    console.error("Error in addNearWinnersSection:", error);
    return PDF_CONFIG.margin + 30; // Return a safe position in case of error
  }
};
