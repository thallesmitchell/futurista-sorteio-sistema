
import { jsPDF } from 'jspdf';
import { Game } from '@/contexts/game/types';
import { 
  createPDF,
  addHeader,
  addPlayersListSection,
  PDF_CONFIG,
  addNearWinnersSection
} from './builders';
import { GeneratePdfOptions, PdfSectionOptions } from './types';

/**
 * Generate a simple PDF with just player information
 * 
 * @param game The game data to generate a report for
 * @param options Configuration options for the PDF
 * @returns Promise that resolves when the PDF is generated
 */
export const generateSimplePdf = async (
  game: Game,
  options: GeneratePdfOptions = {
    themeColor: '#39FF14',
    filename: 'players-list.pdf',
    includeNearWinners: true
  }
): Promise<void> => {
  try {
    console.log('Generating simple PDF for game:', game.name);
    
    // Validate game data
    if (!game || !game.players) {
      throw new Error('Game data is missing or invalid');
    }
    
    // Initialize PDF
    const pdf = createPDF();
    
    // Create section options
    const sectionOptions: PdfSectionOptions = { 
      color: options.themeColor || '#39FF14',
    };
    
    // Add header
    const gameName = typeof game.name === 'string' ? game.name : 'Lista de Jogadores';
    let currentY = addHeader(pdf, gameName, game.start_date, { color: options.themeColor || '#39FF14' });
    
    // Add extra spacing
    currentY += 20;
    
    // Get all drawn numbers from the game
    const allDrawnNumbers = Array.isArray(game.dailyDraws) 
      ? game.dailyDraws.flatMap(draw => Array.isArray(draw.numbers) ? draw.numbers : [])
      : [];
    
    // Add near winners section if requested
    if (options.includeNearWinners && game.dailyDraws && game.dailyDraws.length > 0) {
      try {
        console.log('Adding near winners section to simple PDF');
        const nearWinnersY = addNearWinnersSection(pdf, game, allDrawnNumbers, sectionOptions);
        if (nearWinnersY > 0) {
          currentY = nearWinnersY + 20; // Add space after section
        }
      } catch (error) {
        console.error('Error adding near winners section:', error);
        // Continue with the rest of the PDF
      }
    }
    
    // Check if we need a new page before players section
    if (currentY > PDF_CONFIG.pageHeight - 100) {
      pdf.addPage();
      currentY = PDF_CONFIG.margin + 10;
    }
    
    // Add players section
    console.log('Adding players section to simple PDF');
    addPlayersListSection(pdf, game, currentY);
    
    // Use provided filename or generate one with sanitizing
    const safeFilename = options.filename 
      ? options.filename.replace(/[^\w.-]/g, '-')
      : `players-${(game.name || 'jogo').replace(/[^\w.-]/g, '-')}.pdf`;
    
    // Save PDF
    pdf.save(safeFilename);
    
    console.log('Simple PDF generation completed successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    return Promise.reject(error instanceof Error ? error : new Error('Unknown error in PDF generation'));
  }
};
