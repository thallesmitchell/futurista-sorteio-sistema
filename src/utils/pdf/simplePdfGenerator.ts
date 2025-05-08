
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { createPDF, PDF_CONFIG, addHeader } from './builders/base-pdf';
import { addNearWinnersSection } from './builders/near-winners';
import { addPlayersListSection, safeGetDrawnNumbers } from './builders/players-section';
import { addWinnersSection } from './builders/winners-section';
import { GeneratePdfOptions } from './types';

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
    
    // Create PDF document
    const pdf = createPDF();
    
    // Add header section using the standardized builder
    let yPosition = addHeader(pdf, game.name, game.startDate, { color: options.themeColor || '#39FF14' });
    
    // Get all drawn numbers from the game
    const allDrawnNumbers = safeGetDrawnNumbers(game);
    console.log(`Total drawn numbers: ${allDrawnNumbers.length}`);
    
    // Always check for nearWinners regardless of winners
    // We'll only display them if there are no winners AND includeNearWinners is true
    const hasWinners = Array.isArray(game.winners) && game.winners.length > 0;
    
    // Add near winners section (jogos amarrados) - only if no winners and if requested
    if (options.includeNearWinners === true) {
      console.log('Including near winners section in PDF');
      if (hasWinners) {
        console.log('Game has winners, skipping near winners section');
      } else {
        console.log('No winners found, adding near winners section');
        yPosition = addNearWinnersSection(pdf, game, allDrawnNumbers, { color: options.themeColor || '#39FF14' });
      }
    } else {
      console.log('Near winners section was not requested to be included');
    }
    
    // Add winners section
    yPosition = addWinnersSection(pdf, game, yPosition);
    
    // Add players section
    yPosition = addPlayersListSection(pdf, game, yPosition);
    
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
