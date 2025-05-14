
import { jsPDF } from 'jspdf';
import { Game } from '@/contexts/game/types';
import { createPDF, PDF_CONFIG, addHeader } from './builders/base-pdf';
import { addNearWinnersSection } from './builders/near-winners';
import { addPlayersListSection } from './builders/players-section';
import { addWinnersSection } from './builders/winners-section';
import { addDrawsSection, getLastDrawDate } from './builders/draws-section';
import { GeneratePdfOptions, PdfSectionOptions } from './types';

/**
 * Generate a complete game report PDF
 * @param game The game data
 * @param options Options for PDF generation
 * @returns Promise that resolves when the PDF is saved
 */
export const generateSimplePdf = async (
  game: Game,
  options: GeneratePdfOptions = {
    themeColor: "#39FF14",
    filename: "resultado.pdf",
    includeNearWinners: true
  }
): Promise<void> => {
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
    const sectionOptions: PdfSectionOptions = { 
      color: options.themeColor || '#39FF14',
      maxCombosPerPlayer: 1000 // Show all sequences
    };
    
    // 1. HEADER SECTION
    // Get the date of the last draw or use the game start date
    const lastDrawDate = getLastDrawDate(game.dailyDraws) || game.startDate;
    console.log('Data do último sorteio:', lastDrawDate);
    
    // Add header section using the standardized builder and the last draw date
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
      let winnersY = addWinnersSection(pdf, game, yPosition);
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
      let nearWinnersY = addNearWinnersSection(pdf, game, allDrawnNumbers, sectionOptions);
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
    
    return Promise.resolve();
  } catch (error) {
    console.error("Erro na geração do PDF:", error);
    return Promise.reject(error instanceof Error ? error : new Error("Erro desconhecido na geração do PDF"));
  }
};
