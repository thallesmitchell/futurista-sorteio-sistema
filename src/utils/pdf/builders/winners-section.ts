
import jsPDF from 'jspdf';
import { Game, Player } from '@/contexts/game/types';
import { PDFOptions } from '../types';
import { formatCurrency } from '@/components/game/GameFinancialCards';

/**
 * Add the winners section to the PDF
 */
export function addWinnersSection(doc: jsPDF, game: Game, options: PDFOptions): boolean {
  try {
    if (!game.winners || game.winners.length === 0) {
      console.log('No winners to display in PDF');
      return false;
    }

    console.log('Adding winners section to PDF with ', game.winners.length, ' winners');
    
    // Add trophy as an SVG if provided
    if (options.trophySvgData) {
      const svgWidth = 30;
      const svgHeight = 30;
      const pageWidth = doc.internal.pageSize.width;
      const xPos = (pageWidth / 2) - (svgWidth / 2);
      
      try {
        doc.addSvgAsImage(options.trophySvgData, xPos, 25, svgWidth, svgHeight);
      } catch (svgError) {
        console.error('Error adding SVG trophy:', svgError);
        // Fallback if SVG fails
        doc.setFontSize(24);
        doc.setTextColor(255, 165, 0); // Orange color
        doc.text('🏆', pageWidth / 2, 35, { align: 'center' });
      }
    } else {
      // Fallback if no SVG
      doc.setFontSize(24);
      doc.setTextColor(255, 165, 0); // Orange color
      doc.text('🏆', doc.internal.pageSize.width / 2, 35, { align: 'center' });
    }
    
    // Add header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0); // Green color
    doc.text(
      'GANHADORES!', 
      doc.internal.pageSize.width / 2, 
      65, 
      { align: 'center' }
    );
    
    // Process each winner
    let yPosition = 80;
    game.winners.forEach((winner, index) => {
      // Add winner name with prize amount
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      // Format name and prize (if available)
      const prizeText = winner.prize ? ` - ${formatCurrency(winner.prize)}` : '';
      doc.text(
        `${winner.name}${prizeText}`,
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' }
      );
      
      yPosition += 10;

      // Find winning combinations (with 6 hits)
      const winningCombos = winner.combinations.filter(combo => 
        combo.hits >= (game.requiredHits || 6)
      );
      
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
      
      // Add spacing between winners
      yPosition += 5;
      
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - 40 && index < game.winners.length - 1) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error adding winners section:', error);
    return false;
  }
}
