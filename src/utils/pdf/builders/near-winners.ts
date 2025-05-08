
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import autoTable from 'jspdf-autotable';
import { PdfSectionOptions } from '../types';

// Add "Jogos Amarrados" section (near winners with 5 hits) with simpler styling
export const addNearWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  options: PdfSectionOptions = { color: '#39FF14' }
): number => {
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Find players with combinations that have exactly 5 hits
  const nearWinners = game.players
    .filter(player => player.combinations.some(combo => combo.hits === 5))
    .map(player => {
      const nearWinningCombos = player.combinations.filter(combo => combo.hits === 5);
      return { player, combos: nearWinningCombos };
    })
    .filter(item => item.combos.length > 0);
    
  // If no near winners, return current position
  if (nearWinners.length === 0) {
    return PDF_CONFIG.margin + 30;
  }
  
  // Section title
  let currentY = PDF_CONFIG.margin + 35;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(options.color);
  pdf.text("Jogos Amarrados", PDF_CONFIG.pageWidth / 2, currentY, { align: "center" });
  
  currentY += 8;
  
  // Description
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(PDF_CONFIG.fontSizes.normal);
  pdf.setTextColor('#000000');
  pdf.text(
    'Jogadores com 5 acertos (falta apenas 1 número para ganhar)',
    PDF_CONFIG.pageWidth / 2, 
    currentY,
    { align: 'center' }
  );
  
  currentY += 15;
  
  // Completely redesigned table approach that avoids complex styling in cells
  const tableRows = [];
  
  // Process each near winner for the table - with safer implementation
  for (let i = 0; i < nearWinners.length; i++) {
    const item = nearWinners[i];
    
    // Add player name as header row
    tableRows.push([{
      content: item.player.name,
      colSpan: 1,
      styles: { 
        fontStyle: 'bold', 
        fillColor: [240, 240, 240],
        halign: 'center'
      }
    }]);
    
    // Show combinations for this player (limit to 3 to save space)
    const maxCombos = options.maxCombosPerPlayer || 3;
    const combosToShow = item.combos.slice(0, maxCombos);
    
    // Process each combo separately
    combosToShow.forEach(combo => {
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Create a safe string representation of the numbers
      let numbersText = '';
      
      // Format each number individually with hit highlighting
      sortedNumbers.forEach((num, idx) => {
        const isHit = drawnNumbersSet.has(num);
        const formattedNum = String(num).padStart(2, '0');
        
        // Add space between numbers except for the first one
        if (idx > 0) numbersText += ' ';
        
        // Add the formatted number (no special formatting here - we'll use basic text)
        numbersText += isHit ? `*${formattedNum}*` : formattedNum;
      });
      
      // Add the row with plain text (no complex styling)
      tableRows.push([{
        content: numbersText,
        colSpan: 1,
        styles: { halign: 'center' }
      }]);
    });
    
    // If there are more combinations than shown
    if (item.combos.length > maxCombos) {
      tableRows.push([{
        content: `+ ${item.combos.length - maxCombos} mais sequência${item.combos.length - maxCombos !== 1 ? 's' : ''} com 5 acertos`,
        colSpan: 1,
        styles: { fontStyle: 'italic', textColor: [100, 100, 100], halign: 'center' }
      }]);
    }
    
    // Add spacer between players (except after the last one)
    if (i < nearWinners.length - 1) {
      tableRows.push([{
        content: '',
        colSpan: 1,
        styles: { cellPadding: 2 }
      }]);
    }
  }
  
  // Create table for near winners with much simpler styling
  autoTable(pdf, {
    startY: currentY,
    head: [], // No header row
    body: tableRows,
    theme: 'plain',
    styles: {
      overflow: 'linebreak',
      cellPadding: 5,
      fontSize: 10,
      textColor: [0, 0, 0],
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 'auto' }
    },
    // New simpler cell renderer that handles asterisks for highlighting
    didParseCell: function(data) {
      // Skip if no text content
      if (!data?.cell?.text || !data.cell.text[0]) return;
      
      try {
        // Make sure we're working with a string
        let text = String(data.cell.text[0] || '');
        
        // Look for asterisk markers and replace with styled text
        if (text.includes('*')) {
          const parts = text.split(/\*+/g);
          const styledParts = [];
          
          for (let i = 0; i < parts.length; i++) {
            if (!parts[i]) continue;
            
            // Alternate between regular and highlighted text
            if (i % 2 === 0) {
              // Regular text
              styledParts.push(parts[i]);
            } else {
              // Highlighted text (was between asterisks)
              styledParts.push({
                text: parts[i],
                style: {
                  textColor: [0, 158, 26], // Green color
                  fontStyle: 'bold'
                }
              });
            }
          }
          
          // Only replace if we have valid parts
          if (styledParts.length > 0) {
            data.cell.text = styledParts;
          }
        }
      } catch (error) {
        console.error("Error in didParseCell:", error);
        data.cell.text = ['Error'];
      }
    },
    margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
    tableLineWidth: 0.2,
    tableLineColor: [200, 200, 200]
  });
  
  // Get final Y position
  const finalY = (pdf as any).lastAutoTable.finalY + 15;
  return finalY;
}
