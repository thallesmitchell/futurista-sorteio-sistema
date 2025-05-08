
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import autoTable from 'jspdf-autotable';

// Add players section to PDF with simple tabular format
export const addPlayersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[],
  startY: number,
  options = { color: '#39FF14', maxCombosPerPlayer: 1000 }
): void => {
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Add section title
  let currentY = startY;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor('#000000');
  pdf.text('Jogadores', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 10;
  
  // Prepare sorted players (alphabetically)
  const sortedPlayers = [...game.players].sort((a, b) => a.name.localeCompare(b.name));
  
  // Create table data for players
  const tableData = [];
  
  // Process each player's data for the table
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    
    // Get max hits for player
    const maxHits = Math.max(...player.combinations.map(c => c.hits), 0);
    
    // Create player row data
    const playerData = [
      { content: player.name, styles: { fontStyle: 'bold' } }, 
      { content: `${player.combinations.length} sequência(s)\nMáx. acertos: ${maxHits}`, styles: {} }
    ];
    
    tableData.push(playerData);
    
    // Sort combinations by hits (highest first)
    const sortedCombos = [...player.combinations].sort((a, b) => b.hits - a.hits);
    
    // Show combinations for each player
    sortedCombos.forEach((combo, idx) => {
      // Sort numbers for consistency
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Format numbers with hit highlighting (ONLY the hit numbers are green)
      let numbersStr = sortedNumbers.map(num => {
        const isHit = drawnNumbersSet.has(num);
        const formattedNum = String(num).padStart(2, '0');
        return isHit 
          ? `[${formattedNum}]` // Mark hit numbers for later styling
          : formattedNum;
      }).join(' ');
      
      // Add sequence row
      tableData.push([
        { content: '', styles: {} }, // Empty cell for indentation
        { content: `${combo.hits} acerto${combo.hits !== 1 ? 's' : ''}:`, styles: {} }, 
        { content: numbersStr, styles: {} }
      ]);
    });
    
    // Add spacer row with dashed line between players (except last)
    if (i < sortedPlayers.length - 1) {
      tableData.push([
        { content: '', styles: { borderBottom: '1px dashed #ccc' } },
        { content: '', styles: { borderBottom: '1px dashed #ccc' } },
        { content: '', styles: { borderBottom: '1px dashed #ccc' } }
      ]);
    }
  }
  
  // Configure and create a simple table with alternating rows
  autoTable(pdf, {
    startY: currentY,
    head: [['Jogador', 'Detalhes', 'Sequências']],
    body: tableData,
    theme: 'grid', // Use grid theme for cleaner look
    headStyles: {
      fillColor: [240, 240, 240], // Light gray header
      textColor: [0, 0, 0],       // Black text
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245], // Very light gray for alternate rows
    },
    bodyStyles: {
      fillColor: [255, 255, 255], // White background
    },
    margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
    didParseCell: function(data) {
      // Style for combinations with 6 hits
      if (data.section === 'body' && data.column.index === 1 && 
          data.cell.text && data.cell.text.toString().includes('6 acerto')) {
        data.cell.styles.textColor = [0, 158, 26]; // Green for 6 hits
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Style for hit numbers (marked with brackets)
      if (data.section === 'body' && data.column.index === 2) {
        const cellText = data.cell.text ? data.cell.text.toString() : '';
        
        // Process marked numbers if they exist
        if (cellText.includes('[')) {
          // Replace markers with styled numbers
          const parts = cellText.split(/\[|\]/g);
          const styledParts = [];
          
          // Process each part
          for (let i = 0; i < parts.length; i++) {
            if (parts[i].trim() !== '') {
              // Check if this part should be highlighted (was inside brackets)
              const isHighlighted = i % 2 === 1;
              
              if (isHighlighted) {
                // Style the hit numbers in green
                styledParts.push({
                  text: parts[i],
                  style: { 
                    textColor: [0, 158, 26],   // Green text
                    fontStyle: 'bold'          // Bold text
                  }
                });
              } else {
                // Regular black text for non-hits
                styledParts.push(parts[i]);
              }
            }
          }
          
          // Replace cell content with rich text
          data.cell.text = styledParts;
        }
      }
    },
    tableLineWidth: 0.2,
    tableLineColor: [200, 200, 200]
  });
}
