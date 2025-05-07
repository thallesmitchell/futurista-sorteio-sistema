
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { 
  createPDF, 
  addHeader,
  addNearWinnersSection,
  addWinnersSection,
  addPlayersSection,
  PDF_CONFIG
} from './builders';

// Generate and download complete PDF report
export const generateGameReport = async (
  game: Game,
  options = { 
    themeColor: '#39FF14',
    filename: 'resultado.pdf',
    includeNearWinners: true
  }
): Promise<void> => {
  try {
    console.log('Iniciando geração de PDF para o jogo:', game.name);
    
    // Get all drawn numbers from the game
    const allDrawnNumbers = game.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];
    
    // Initialize PDF
    const pdf = await createPDF();
    
    // Add header
    addHeader(pdf, game.name, new Date(), { color: options.themeColor });
    
    // Track current Y position
    let currentY = PDF_CONFIG.margin + 30;
    
    // If there are winners, don't add near winners section (as requested)
    const hasWinners = game.winners && game.winners.length > 0;
    
    // Add near winners section only if no winners and if requested
    if (options.includeNearWinners && !hasWinners) {
      currentY = addNearWinnersSection(pdf, game, allDrawnNumbers, { color: options.themeColor });
    }
    
    // Add winners section (if any)
    currentY = addWinnersSection(pdf, game, allDrawnNumbers, currentY, { color: options.themeColor });
    
    // Check if we need a new page before players section
    if (currentY > PDF_CONFIG.pageHeight - 100) {
      pdf.addPage();
      currentY = PDF_CONFIG.margin;
    }
    
    // Add players section - showing ALL sequences
    addPlayersSection(pdf, game, allDrawnNumbers, currentY, { 
      color: options.themeColor,
      maxCombosPerPlayer: 1000 // Show all sequences as requested
    });
    
    // Use provided filename or generate one
    const filename = options.filename || `resultado-${game.name.replace(/\s+/g, '-')}.pdf`;
    
    // Save PDF
    pdf.save(filename);
    
    console.log('PDF generation completed successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}

// Re-export required PDF_CONFIG so it's available to consumers
export { PDF_CONFIG } from './builders';
