
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { createPDF, PDF_CONFIG, addHeader } from './builders/base-pdf';
import { addNearWinnersSection } from './builders/near-winners';
import { addPlayersListSection, safeGetDrawnNumbers } from './builders/players-section';
import { addWinnersSection } from './builders/winners-section';
import { addDrawsSection, getLastDrawDate } from './builders/draws-section';
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
    console.log(`Total de jogadores: ${game.players.length}`);
    console.log(`Total de sorteios: ${game.dailyDraws.length}`);
    
    // Create PDF document
    const pdf = createPDF();
    
    // Obter a data do último sorteio (se houver) ou usar a data de início do jogo
    const lastDrawDate = getLastDrawDate(game.dailyDraws) || game.startDate;
    console.log('Data do último sorteio:', lastDrawDate);
    
    // Add header section using the standardized builder and the last draw date
    let yPosition = addHeader(pdf, game.name, lastDrawDate, { color: options.themeColor || '#39FF14' });
    
    // Adicionar seção de sorteios realizados logo após o cabeçalho
    yPosition = addDrawsSection(pdf, game.dailyDraws, yPosition);
    console.log(`Y-position after draws section: ${yPosition}`);
    
    // Get all drawn numbers from the game
    const allDrawnNumbers = safeGetDrawnNumbers(game);
    console.log(`Total drawn numbers: ${allDrawnNumbers.length}`);
    console.log(`All drawn numbers: ${allDrawnNumbers.join(', ')}`);
    
    // Check if we have winners
    const hasWinners = Array.isArray(game.winners) && game.winners.length > 0;
    
    // ALWAYS add winners section if winners exist - do this before near winners
    if (hasWinners) {
      console.log('Adding winners section in PDF (winners found)');
      yPosition = addWinnersSection(pdf, game, yPosition);
      console.log(`Y-position after winners section: ${yPosition}`);
    } 
    // Only add near winners section if there are NO winners and if requested
    else if (options.includeNearWinners !== false) {
      console.log('Including near winners section in PDF (no winners found)');
      yPosition = addNearWinnersSection(pdf, game, allDrawnNumbers, { color: options.themeColor || '#39FF14' });
      console.log(`Y-position after near winners section: ${yPosition}`);
    } else {
      console.log('Near winners section was not requested to be included');
    }
    
    // Check if we need to add a new page before players list
    if (yPosition > PDF_CONFIG.pageHeight - 70) {
      pdf.addPage();
      yPosition = PDF_CONFIG.margin;
    }
    
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
