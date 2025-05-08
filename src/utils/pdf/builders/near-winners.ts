
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
    const drawnNumbersSet = new Set(allDrawnNumbers);
    
    // Find players with combinations that have exactly 5 hits
    const nearWinners = findNearWinners(game);
      
    // If no near winners, return current position
    if (nearWinners.length === 0) {
      return PDF_CONFIG.margin + 30;
    }
    
    // Draw section header
    const currentY = drawNearWinnersHeader(pdf, options);
    
    // Create table data
    const tableData = createNearWinnersTableData(nearWinners, drawnNumbersSet);
    
    // Generate table and return final Y position
    return generateNearWinnersTable(pdf, tableData, currentY);
  } catch (error) {
    console.error("Error in addNearWinnersSection:", error);
    return PDF_CONFIG.margin + 30; // Return a safe position in case of error
  }
};
