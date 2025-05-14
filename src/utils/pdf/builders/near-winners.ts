
import { Game, Player } from '@/contexts/game/types';
import jsPDF from 'jspdf';
import { GeneratePdfOptions } from '../types';
import { createTableHeader, addSubtitle } from './utils/pdf-table-utils';
import { generateNearWinnersTable } from './near-winners/table-renderer';
import { getNearWinners } from './near-winners/data-helpers';
import { NearWinner } from '../types';

/**
 * Adds a section for near winners (players with 5 hits) to the PDF
 */
export const addNearWinnersSection = async (
  doc: jsPDF,
  game: Game,
  options: GeneratePdfOptions = {}
): Promise<void> => {
  if (!options.includeNearWinners) {
    return;
  }

  try {
    // Add a page break if there's content already
    if (doc.getNumberOfPages() > 0 && doc.internal.getCurrentPageInfo().pageNumber > 1) {
      doc.addPage();
    }

    // Add section header
    addSubtitle(doc, 'Quase Ganhadores (5 Acertos)', 14);
    
    // Get near winners (players with 5 hits)
    const nearWinners = getNearWinners(game);
    
    if (nearWinners.length > 0) {
      // Create table with near winners data
      await generateNearWinnersTable(doc, nearWinners);
    } else {
      doc.setFontSize(12);
      doc.text('Nenhum jogador com 5 acertos encontrado.', 14, doc.autoTable.previous.finalY + 10);
    }
  } catch (error) {
    console.error('Error adding near winners section:', error);
  }
};
