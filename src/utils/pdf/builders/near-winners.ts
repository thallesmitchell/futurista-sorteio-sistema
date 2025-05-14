
import { Game } from '@/contexts/game/types';
import jsPDF from 'jspdf';
import { GeneratePdfOptions } from '../types';
import { createTableHeader, addSubtitle } from './utils/pdf-table-utils';
import { generateNearWinnersTable } from './near-winners/table-renderer';
import { findNearWinners } from './near-winners/data-helpers';

/**
 * Adds a section for near winners (players with 5 hits) to the PDF
 */
export const addNearWinnersSection = async (
  doc: jsPDF,
  game: Game,
  allDrawnNumbers: number[] = [],
  options: GeneratePdfOptions = {}
): Promise<number> => {
  if (!options.includeNearWinners) {
    return 0;
  }

  try {
    // Add a page break if there's content already and not the first page
    const pageNumber = doc.getNumberOfPages();
    if (pageNumber > 1) {
      const pageInfo = doc.internal.getCurrentPageInfo?.();
      if (pageInfo && pageInfo.pageNumber > 1) {
        doc.addPage();
      }
    }

    // Add section header
    const yPos = addSubtitle(doc, 'Quase Ganhadores (5 Acertos)', 14);
    
    // Get near winners (players with 5 hits)
    const nearWinners = findNearWinners(game.players, 5);
    
    if (nearWinners.length > 0) {
      // Format data for table
      const tableData = nearWinners.map(winner => [
        winner.playerName,
        winner.numbers.map(n => n.toString().padStart(2, '0')).join(' ')
      ]);
      
      // Create table with near winners data
      const finalY = generateNearWinnersTable(doc, tableData, yPos);
      return finalY;
    } else {
      doc.setFontSize(12);
      doc.text('Nenhum jogador com 5 acertos encontrado.', 14, yPos + 10);
      return yPos + 30;
    }
  } catch (error) {
    console.error('Error adding near winners section:', error);
    return 0;
  }
};
