
import jsPDF from 'jspdf';
import { Game, Player, Winner } from '@/contexts/game/types';
import { formatCurrency } from '@/components/game/GameFinancialCards';
import { PdfSectionOptions } from '../types';

/**
 * Add the winners section to the PDF
 * @returns The Y position after adding the section
 */
export function addWinnersSection(doc: jsPDF, game: Game, yPosition: number): number {
  try {
    if (!game.winners || game.winners.length === 0) {
      console.log('No winners to display in PDF');
      return yPosition;
    }

    console.log('Adding winners section to PDF with ', game.winners.length, ' winners');
    
    // Add trophy as SVG if provided
    doc.setFontSize(24);
    doc.setTextColor(255, 165, 0); // Orange color
    doc.text('🏆', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    
    // Add header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0); // Green color
    doc.text(
      'GANHADORES!', 
      doc.internal.pageSize.width / 2, 
      yPosition, 
      { align: 'center' }
    );
    
    yPosition += 15;
    
    // Process each winner
    game.winners.forEach((winner, index) => {
      // Add winner name with prize amount
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      // Format name and prize (if available)
      // Get the name from name property or from related player
      const winnerName = winner.name || `Ganhador #${index + 1}`;
      const prizeText = winner.prize_amount ? ` - ${formatCurrency(winner.prize_amount)}` : 
                         winner.prize ? ` - ${formatCurrency(winner.prize)}` : '';
      
      doc.text(
        `${winnerName}${prizeText}`,
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' }
      );
      
      yPosition += 10;

      // Find winning combinations - either from winner or related player
      // Check if winner has winning combinations directly
      const winningCombos = winner.combinations ? 
        winner.combinations.filter(combo => combo.hits >= (game.requiredHits || 6)) : 
        // For DB winners we need to find the player and get the combinations
        game.players.find(p => p.id === winner.player_id)?.combinations
          .filter(combo => combo.hits >= (game.requiredHits || 6)) || [];
      
      if (winningCombos.length > 0) {
        winningCombos.forEach(combo => {
          // Sort numbers for display
          const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
          
          // Format numbers as string with zero-padding
          const numbersText = sortedNumbers
            .map(n => n.toString().padStart(2, '0'))
            .join(' - ');
          
          // Add the winning numbers
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(
            numbersText,
            doc.internal.pageSize.width / 2,
            yPosition,
            { align: 'center' }
          );
          
          yPosition += 15;
        });
      }
      
      // Add spacing between winners
      yPosition += 5;
      
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - 40 && index < game.winners.length - 1) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    return yPosition;
  } catch (error) {
    console.error('Error adding winners section:', error);
    return yPosition;
  }
}
