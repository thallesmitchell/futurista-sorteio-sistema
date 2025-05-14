
// Re-export main functions from the pdf directory
export * from './builders';
export * from './types';

// Import types and other modules
import { Game } from '@/contexts/game/types';
import { GeneratePdfOptions } from './types';
import { 
  createPDF, addHeader, addNearWinnersSection, addWinnersSection, 
  addPlayersListSection, PDF_CONFIG, addDrawsSection, getLastDrawDate 
} from './builders';

/**
 * Generate a PDF report for a game
 */
export const generateGameReport = async (game: Game, options: GeneratePdfOptions = {}) => {
  console.log('Starting PDF generation for game:', game.id);
  console.log('Game has winners:', game.winners?.length || 0);
  
  try {
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
    console.log(`Game winners: ${game.winners?.length || 0}`);
    
    // Initialize PDF with white background
    const pdf = createPDF();
    
    // Create section options with proper typing
    const sectionOptions = { 
      color: options.themeColor || '#39FF14',
      maxCombosPerPlayer: 1000 // Show all sequences for completeness
    };
    
    // Get the date of the last draw or use the game start date
    const lastDrawDate = getLastDrawDate(game.dailyDraws) || game.startDate;
    
    // Add header with better error handling for dates
    const gameName = typeof game.name === 'string' ? game.name : 'Resultado';
    let currentY = addHeader(pdf, gameName, lastDrawDate, { color: options.themeColor || '#39FF14' });
    
    // Extra spacing after header
    currentY += 10;
    
    // Check if we have winners
    const hasWinners = Array.isArray(game.winners) && game.winners.length > 0;
    console.log(`Has winners: ${hasWinners}, count: ${hasWinners ? game.winners.length : 0}`);
    
    if (hasWinners) {
      console.log('Winners found, adding winners section to PDF');
      // FIRST: always add winners section if winners exist
      try {
        // Add winners section with detailed logging
        console.log('Adding winners section with:', game.winners);
        const winnersY = addWinnersSection(pdf, game, currentY);
        if (winnersY > 0) {
          currentY = winnersY;
        }
        console.log('Winners section added successfully, currentY:', currentY);
      } catch (error) {
        console.error('Error adding winners section:', error);
        // Continue with the rest of the PDF even if this section fails
      }
      
      // Check if we need to add a new page before the draws section
      if (currentY > PDF_CONFIG.pageHeight - 60) {
        pdf.addPage();
        currentY = PDF_CONFIG.margin + 10;
      } else {
        // Add extra spacing between sections
        currentY += 20;
      }
    } 
    // SECOND: If no winners, add near winners section (if requested)
    else if (options.includeNearWinners) {
      console.log('No winners, adding near winners section');
      const nearWinnersY = addNearWinnersSection(pdf, game, allDrawnNumbers, sectionOptions);
      if (nearWinnersY > 0) {
        currentY = nearWinnersY;
      }
      
      // Check if we need to add a new page before the draws section
      if (currentY > PDF_CONFIG.pageHeight - 60) {
        pdf.addPage();
        currentY = PDF_CONFIG.margin + 10;
      } else {
        // Add extra spacing between sections
        currentY += 20;
      }
    }
    
    // THIRD: Add draws section
    console.log('Adding draws section to PDF');
    currentY = addDrawsSection(pdf, game.dailyDraws, currentY);
    
    // Check if we need a new page before players section
    if (currentY > PDF_CONFIG.pageHeight - 100) {
      pdf.addPage();
      currentY = PDF_CONFIG.margin + 10;
    } else {
      // Add extra spacing between sections
      currentY += 20;
    }
    
    // FOURTH: Add players section in a tabular format
    console.log('Adding players section to PDF');
    addPlayersListSection(pdf, game, currentY);
    
    // Use provided filename or generate one with sanitizing
    const safeFilename = options.filename 
      ? options.filename.replace(/[^\w.-]/g, '-')
      : `resultado-${(game.name || 'jogo').replace(/[^\w.-]/g, '-')}.pdf`;
    
    // Save PDF
    pdf.save(safeFilename);
    
    console.log('PDF generation completed successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error instanceof Error ? error : new Error('Unknown error in PDF generation');
  }
};

/**
 * Generate a simple player list PDF
 */
export const generateSimplePdf = async (game: Game, options: GeneratePdfOptions = {}) => {
  try {
    // Input validation
    if (!game) {
      throw new Error("Dados do jogo não fornecidos");
    }
    
    if (!game.players || !Array.isArray(game.players)) {
      throw new Error("Lista de jogadores inválida");
    }
    
    if (!game.dailyDraws || !Array.isArray(game.dailyDraws)) {
      throw new Error("Lista de sorteios inválida");
    }
    
    console.log(`Gerando PDF para ${game.name || 'jogo sem nome'}`);
    console.log(`Total de jogadores: ${game.players.length}`);
    console.log(`Total de sorteios: ${game.dailyDraws.length}`);
    
    // Create PDF document
    const pdf = createPDF();
    
    // Create section options
    const sectionOptions = { 
      color: options.themeColor || '#39FF14',
      maxCombosPerPlayer: 1000 // Show all sequences
    };
    
    // 1. HEADER SECTION
    // Get the date of the last draw or use the game start date
    const lastDrawDate = getLastDrawDate(game.dailyDraws) || game.startDate;
    console.log('Data do último sorteio:', lastDrawDate);
    
    // Add header section
    let yPosition = addHeader(pdf, game.name, lastDrawDate, { color: options.themeColor || '#39FF14' });
    
    // Add extra spacing after header
    yPosition += 10;
    
    // Get all drawn numbers from the game
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => Array.isArray(draw.numbers) ? draw.numbers : []);
    console.log(`Total drawn numbers: ${allDrawnNumbers.length}`);
    
    // Check if we have winners from the database
    const hasWinners = Array.isArray(game.winners) && game.winners.length > 0;
    console.log(`Game has winners: ${hasWinners}, count: ${hasWinners ? game.winners.length : 0}`);
    
    // 2. WINNERS OR NEAR WINNERS SECTION
    if (hasWinners) {
      console.log('Adding winners section in PDF');
      const winnersY = addWinnersSection(pdf, game, yPosition);
      if (winnersY > 0) {
        yPosition = winnersY;
      }
      
      // Check if we need to add a new page before the draws section
      if (yPosition > PDF_CONFIG.pageHeight - 60) {
        pdf.addPage();
        yPosition = PDF_CONFIG.margin + 10;
      } else {
        // Add extra spacing between sections
        yPosition += 15;
      }
    } 
    // Only add near winners section if there are NO winners and if requested
    else if (options.includeNearWinners !== false) {
      console.log('Including near winners section in PDF');
      const nearWinnersY = addNearWinnersSection(pdf, game, allDrawnNumbers, sectionOptions);
      if (nearWinnersY > 0) {
        yPosition = nearWinnersY;
      }
      
      // Check if we need to add a new page before the draws section
      if (yPosition > PDF_CONFIG.pageHeight - 60) {
        pdf.addPage();
        yPosition = PDF_CONFIG.margin + 10;
      } else {
        // Add extra spacing between sections
        yPosition += 15;
      }
    }
    
    // 3. DRAWS SECTION
    yPosition = addDrawsSection(pdf, game.dailyDraws, yPosition);
    console.log(`Y-position after draws section: ${yPosition}`);
    
    // Check if we need to add a new page before players section
    if (yPosition > PDF_CONFIG.pageHeight - 100) {
      pdf.addPage();
      yPosition = PDF_CONFIG.margin + 10;
    } else {
      // Add extra spacing between sections
      yPosition += 15;
    }
    
    // 4. PLAYERS SECTION
    addPlayersListSection(pdf, game, yPosition);
    
    // Sanitize filename
    const safeFilename = options.filename
      ? options.filename.replace(/[^\w.-]/g, "-")
      : `resultado-${(game.name || 'jogo').replace(/[^\w.-]/g, "-")}.pdf`;
    
    // Save PDF
    pdf.save(safeFilename);
  } catch (error) {
    console.error("Erro na geração do PDF:", error);
    throw error instanceof Error ? error : new Error("Erro desconhecido na geração do PDF");
  }
};

// Re-export required PDF_CONFIG so it's available to consumers
export { PDF_CONFIG } from './builders/base-pdf';
