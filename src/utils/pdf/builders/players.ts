
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import autoTable from 'jspdf-autotable';

// Add players section to PDF
export const addPlayersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[],
  startY: number,
  options = { color: '#39FF14', maxCombosPerPlayer: 1000 } // Show ALL sequences as requested
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
    
    // Sort combinations by hits (highest first)
    const sortedCombos = [...player.combinations].sort((a, b) => b.hits - a.hits);
    
    // Create player row data
    const playerData = [
      { content: player.name, styles: { fontStyle: 'bold' } }, 
      { content: `${player.combinations.length} sequência(s)\nMáx. acertos: ${maxHits}`, styles: {} }
    ];
    
    tableData.push(playerData);
    
    // Show ALL sequences as requested
    sortedCombos.forEach((combo, idx) => {
      // Sort the numbers
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Create formatted string for number sequence with highlight for hits
      let numbersText = '';
      sortedNumbers.forEach(num => {
        const formatted = String(num).padStart(2, '0');
        const hit = drawnNumbersSet.has(num);
        
        if (hit) {
          // Only hit numbers are bold and green
          numbersText += `[${formatted}] `; // Highlight hit numbers
        } else {
          numbersText += `${formatted} `;
        }
      });
      
      // Add sequence row with hit count
      tableData.push([
        { content: '', styles: {} }, // Empty space for indentation, name will repeat on page break
        { content: `${combo.hits} acerto${combo.hits !== 1 ? 's' : ''}:`, styles: {} }, 
        { content: numbersText, styles: {} }
      ]);
    });
    
    // Add spacer row between players with dashed line
    if (i < sortedPlayers.length - 1) {
      tableData.push([
        { content: '', styles: { borderTop: '3px dashed #172842' } },
        { content: '', styles: { borderTop: '3px dashed #172842' } },
        { content: '', styles: { borderTop: '3px dashed #172842' } }
      ]);
    }
  }
  
  // Configure and create table with header repetition
  autoTable(pdf, {
    startY: currentY,
    head: [['Jogador', 'Detalhes', 'Sequências']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [50, 50, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'normal' },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
    didParseCell: function(data) {
      // Style for numbers with 6 hits in green
      if (data.section === 'body' && data.column.index === 1 && data.cell.text && data.cell.text.toString().includes('6 acerto')) {
        data.cell.styles.textColor = [0, 150, 0];
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Visual marker for hit numbers in brackets
      if (data.section === 'body' && data.column.index === 2) {
        const text = data.cell.text ? data.cell.text.toString() : '';
        if (text.includes('[')) {
          // Only bracketed numbers are green
          data.cell.styles.textColor = [0, 150, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    // Repeat header and player name on page breaks
    didDrawPage: function(data) {
      // Headers are repeated automatically
    },
    rowPageBreak: 'auto', // Auto row break
    showFoot: 'everyPage',
    tableLineWidth: 0.2,
    tableLineColor: [80, 80, 80]
  });
}
