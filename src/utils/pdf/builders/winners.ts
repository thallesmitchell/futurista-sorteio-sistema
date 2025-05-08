
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import autoTable from 'jspdf-autotable';

// Add winners section to PDF with simplified styling
export const addWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  startY: number,
  options = { color: '#39FF14' }
): number => {
  // If no winners, return current position
  if (!game.winners || game.winners.length === 0) {
    return startY;
  }
  
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Section title
  let currentY = startY;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor('#009e1a'); // Green for emphasis
  pdf.text('SAIU GANHADOR!', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 15;
  
  // Create winners table data
  const tableData = [];
  
  // Process each winner
  game.winners.forEach((winner, index) => {
    const playerData = game.players.find(p => p.id === winner.id);
    if (!playerData) return;
    
    const winningCombos = playerData.combinations.filter(c => c.hits === 6);
    
    // Add winner name as header row with highlight
    tableData.push([{
      content: playerData.name.toUpperCase(), 
      styles: { 
        fontStyle: 'bold', 
        fontSize: 12,
        fillColor: [229, 249, 232], // Light green background
        textColor: [0, 158, 26]     // Green text
      }
    }]);
    
    // Add each winning combination
    winningCombos.forEach(combo => {
      // Sort numbers for consistency
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Format the winning numbers (all are hits by definition)
      const numbersStr = sortedNumbers.map(num => {
        return `[${String(num).padStart(2, '0')}]`;
      }).join(' ');
      
      tableData.push([{ 
        content: numbersStr, 
        styles: { 
          fillColor: [229, 249, 232], // Light green background
          alignment: 'center'
        } 
      }]);
    });
    
    // Add spacer between winners if needed
    if (index < game.winners.length - 1) {
      tableData.push([{ content: '', styles: {} }]);
    }
  });
  
  // Create winners table
  autoTable(pdf, {
    startY: currentY,
    body: tableData,
    theme: 'grid',
    styles: {
      overflow: 'linebreak',
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 'auto' }
    },
    didParseCell: function(data) {
      // Style for winning numbers (all marked with brackets)
      if (data.section === 'body' && data.cell.text && data.cell.text.toString().includes('[')) {
        const cellText = data.cell.text.toString();
        const parts = cellText.split(/\[|\]/g);
        const styledParts = [];
        
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].trim() !== '') {
            const isHighlighted = i % 2 === 1;
            
            if (isHighlighted) {
              // Style the winning numbers in bold green
              styledParts.push({
                text: parts[i],
                style: { 
                  textColor: [0, 158, 26],
                  fontStyle: 'bold',
                  fontSize: 12
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
