
import { jsPDF } from 'jspdf';
import { Game } from '@/contexts/game/types';
import { 
  createPDF, 
  addHeader,
  addNearWinnersSection,
  addWinnersSection,
  addPlayersListSection,
  PDF_CONFIG,
  addDrawsSection,
  getLastDrawDate
} from './builders';
import { PdfSectionOptions } from './types';

/**
 * Generate and download complete PDF report for a game
 * 
 * @param game The game data to generate a report for
 * @param options Configuration options for the PDF
 * @returns Promise that resolves when the PDF is generated
 */
export const generateGameReport = async (
  game: Game,
  options = { 
    themeColor: '#39FF14',
    filename: 'resultado.pdf',
    includeNearWinners: true
  }
): Promise<void> => {
  try {
    console.log('Generating PDF report for game:', game.name);
    
    // Validate input parameters
    if (!game) {
      throw new Error('Game data is missing');
    }
    
    if (!game.name) {
      console.warn('Game name is missing, using default');
    }
    
    // Get all drawn numbers from the game
    const allDrawnNumbers = Array.isArray(game.dailyDraws) 
      ? game.dailyDraws.flatMap(draw => Array.isArray(draw.numbers) ? draw.numbers : [])
      : [];
    
    console.log(`Total drawn numbers: ${allDrawnNumbers.length}`);
    
    // Initialize PDF with white background
    const pdf = createPDF();
    
    // Create section options with proper typing
    const sectionOptions: PdfSectionOptions = { 
      color: options.themeColor,
      maxCombosPerPlayer: 1000 // Show all sequences for completeness
    };
    
    // Get the date of the last draw or use the game start date
    const lastDrawDate = getLastDrawDate(game.dailyDraws) || game.startDate;
    
    // Add header with better error handling for dates
    const gameName = typeof game.name === 'string' ? game.name : 'Resultado';
    let currentY = addHeader(pdf, gameName, lastDrawDate, { color: options.themeColor });
    
    // Extra spacing after header
    currentY += 10;
    
    // Check if we have winners
    const hasWinners = Array.isArray(game.winners) && game.winners.length > 0;
    
    // FIRST: always add winners section if winners exist
    if (hasWinners) {
      // Add winners section
      currentY = addWinnersSection(pdf, game, currentY);
      
      // Check if we need to add a new page before the draws section
      if (currentY > PDF_CONFIG.pageHeight - 60) {
        pdf.addPage();
        currentY = PDF_CONFIG.margin + 10;
      } else {
        // Add extra spacing between sections
        currentY += 15;
      }
    } 
    // SECOND: If no winners, add near winners section (if requested)
    else if (options.includeNearWinners) {
      currentY = addNearWinnersSection(pdf, game, allDrawnNumbers, sectionOptions);
      
      // Check if we need to add a new page before the draws section
      if (currentY > PDF_CONFIG.pageHeight - 60) {
        pdf.addPage();
        currentY = PDF_CONFIG.margin + 10;
      } else {
        // Add extra spacing between sections
        currentY += 15;
      }
    }
    
    // THIRD: Add draws section
    currentY = addDrawsSection(pdf, game.dailyDraws, currentY);
    
    // Check if we need a new page before players section
    if (currentY > PDF_CONFIG.pageHeight - 100) {
      pdf.addPage();
      currentY = PDF_CONFIG.margin + 10;
    } else {
      // Add extra spacing between sections
      currentY += 15;
    }
    
    // FOURTH: Add players section in a tabular format
    addPlayersListSection(pdf, game, currentY);
    
    // Use provided filename or generate one with sanitizing
    const safeFilename = options.filename 
      ? options.filename.replace(/[^\w.-]/g, '-')
      : `resultado-${(game.name || 'jogo').replace(/[^\w.-]/g, '-')}.pdf`;
    
    // Save PDF
    pdf.save(safeFilename);
    
    console.log('PDF generation completed successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error instanceof Error ? error : new Error('Unknown error in PDF generation'));
  }
}

// Re-export required PDF_CONFIG so it's available to consumers
export { PDF_CONFIG } from './builders/base-pdf';
