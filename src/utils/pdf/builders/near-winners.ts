
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import autoTable from 'jspdf-autotable';

// Add "Jogos Amarrados" section (near winners with 5 hits) with simpler styling
export const addNearWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  options = { color: '#39FF14' }
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
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Jogos Amarrados', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 8;
  
  // Description
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.textFontSize);
  pdf.setTextColor('#000000');
  pdf.text(
    'Jogadores com 5 acertos (falta apenas 1 número para ganhar)',
    PDF_CONFIG.pageWidth / 2, 
    currentY,
    { align: 'center' }
  );
  
  currentY += 15;
  
  // Create table data for near winners
  const tableData = [];
  
  // Process each near winner for the table
  nearWinners.forEach((item, index) => {
    // Add player name as header row
    tableData.push([
      { content: item.player.name, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
    ]);
    
    // Show combinations for this player (limit to 3 to save space)
    const combosToShow = item.combos.slice(0, 3);
    
    combosToShow.forEach(combo => {
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Format numbers with hit highlighting (ONLY hit numbers are green)
      const numbersStr = sortedNumbers.map(num => {
        const isHit = drawnNumbersSet.has(num);
        const formattedNum = String(num).padStart(2, '0');
        return isHit 
          ? `[${formattedNum}]` // Mark hit numbers for styling
          : formattedNum;
      }).join(' ');
      
      tableData.push([{ content: numbersStr, styles: {} }]);
    });
    
    // If there are more combinations than shown
    if (item.combos.length > 3) {
      tableData.push([{ 
        content: `+ ${item.combos.length - 3} mais sequência${item.combos.length - 3 !== 1 ? 's' : ''} com 5 acertos`, 
        styles: { fontStyle: 'italic', textColor: [100, 100, 100] } 
      }]);
    }
    
    // Add spacer between players
    if (index < nearWinners.length - 1) {
      tableData.push([{ content: '', styles: { borderBottom: '1px dashed #ccc' } }]);
    }
  });
  
  // Create table for near winners
  autoTable(pdf, {
    startY: currentY,
    body: tableData,
    theme: 'grid',
    styles: {
      overflow: 'linebreak',
      cellPadding: 5,
      fontSize: 10,
      textColor: [0, 0, 0]
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    },
    columnStyles: {
      0: { cellWidth: 'auto' }
    },
    didParseCell: function(data) {
      // Style for hit numbers (marked with brackets)
      if (data.cell.text && data.cell.text.toString().includes('[')) {
        const cellText = data.cell.text.toString();
        const parts = cellText.split(/\[|\]/g);
        const styledParts = [];
        
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].trim() !== '') {
            // Check if this part should be highlighted
            const isHighlighted = i % 2 === 1;
            
            if (isHighlighted) {
              // Style the hit numbers in green
              styledParts.push({
                text: parts[i],
                style: { 
                  textColor: [0, 158, 26],
                  fontStyle: 'bold' 
                }
              });
            } else {
              styledParts.push(parts[i]);
            }
          }
        }
        
        // Replace cell content with rich text
        data.cell.text = styledParts;
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
