
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
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(options.color);
  pdf.text('Jogos Amarrados', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 8;
  
  // Description
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSizes.normal);
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
    const maxCombos = options.maxCombosPerPlayer || 3;
    const combosToShow = item.combos.slice(0, maxCombos);
    
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
    if (item.combos.length > maxCombos) {
      tableData.push([{ 
        content: `+ ${item.combos.length - maxCombos} mais sequência${item.combos.length - maxCombos !== 1 ? 's' : ''} com 5 acertos`, 
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
      // Complete rewrite of the cell parsing logic to handle all possible cases
      try {
        // First ensure data.cell.text exists
        if (!data.cell.text) {
          data.cell.text = [''];
          return;
        }
        
        // Ensure cell.text is always an array
        if (!Array.isArray(data.cell.text)) {
          data.cell.text = [String(data.cell.text || '')];
          return;
        }
        
        // If the array is empty, set a default value
        if (data.cell.text.length === 0) {
          data.cell.text = [''];
          return;
        }
        
        // Get the first element and ensure it's a string
        let cellText = String(data.cell.text[0] || '');
        
        // Only process if it contains our markers
        if (cellText.includes('[') && cellText.includes(']')) {
          // Split by our markers
          const parts = cellText.split(/\[|\]/g).filter(part => part !== '');
          const styledParts = [];
          
          for (let i = 0; i < parts.length; i++) {
            // Check if this part should be highlighted (odd indices were inside brackets)
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
          
          // Replace cell content with rich text
          data.cell.text = styledParts;
        }
      } catch (error) {
        console.error("Error processing cell text:", error);
        // Ensure cell text is a safe string array if parsing fails
        data.cell.text = ['Error processing text'];
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
