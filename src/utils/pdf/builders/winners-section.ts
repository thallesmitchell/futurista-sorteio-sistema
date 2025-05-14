
import jsPDF from 'jspdf';
import { Game, Winner } from '@/contexts/game/types';
import { PdfSectionOptions } from '../types';
import { addTableHeader, drawTable, addSubtitle } from './utils/pdf-table-utils';

/**
 * Add winners section to the PDF
 * 
 * @param doc PDF document
 * @param game Game data
 * @param startY Starting Y position
 * @param options PDF options
 * @returns New Y position after adding the section
 */
export function addWinnersSection(
  doc: jsPDF, 
  game: Game,
  startY: number,
  options: PdfSectionOptions = { color: '#39FF14' }
): number {
  try {
    // Extract winners from game
    const { winners } = game;
    
    // Skip if no winners
    if (!winners || winners.length === 0) {
      console.log('No winners to display');
      return startY;
    }
    
    // Add section header
    const headerY = addTableHeader(doc, 'VENCEDORES', startY, options);
    let currentY = headerY + 5;

    // Add subtitle with number of winners
    const subtitle = `${winners.length} vencedor${winners.length > 1 ? 'es' : ''}`;
    currentY = addSubtitle(doc, subtitle, currentY) + 10;

    // Format winners data for table
    const tableData = winners.map((winner: Winner) => {
      // Determine prize amount
      const prizeAmount = winner.prize_amount || winner.prize || 0;
      
      return [
        // Use name from winner or try to find it in players
        winner.name || findPlayerName(game, winner.player_id) || 'Desconhecido',
        // Format prize with proper currency formatting
        `R$ ${Number(prizeAmount).toFixed(2)}`,
        // Format date in Brazilian format
        formatDate(winner.created_at)
      ];
    });
    
    // Define table columns
    const columns = [
      { header: 'Nome', dataKey: 'name' },
      { header: 'Prêmio', dataKey: 'prize' },
      { header: 'Data', dataKey: 'date' }
    ];
    
    // Calculate relative column widths
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidths = {
      name: pageWidth * 0.5, // 50% of page width
      prize: pageWidth * 0.25, // 25% of page width
      date: pageWidth * 0.25 // 25% of page width
    };
    
    // Draw winners table
    const tableY = drawTable(doc, columns, tableData, currentY, {
      columnStyles: {
        0: { cellWidth: colWidths.name },
        1: { cellWidth: colWidths.prize, halign: 'right' },
        2: { cellWidth: colWidths.date, halign: 'center' }
      }
    });
    
    // Return position after table
    return tableY + 10;
  } catch (error) {
    console.error('Error adding winners section:', error);
    return startY + 10;
  }
}

/**
 * Format date string to Brazilian format (DD/MM/YYYY)
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Data inválida';
  }
}

/**
 * Find player name from player ID
 */
function findPlayerName(game: Game, playerId: string): string | null {
  try {
    if (!game.players || !Array.isArray(game.players)) return null;
    
    const player = game.players.find(p => p.id === playerId);
    return player ? player.name : null;
  } catch (error) {
    return null;
  }
}
