
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import autoTable from 'jspdf-autotable';
import { PdfSectionOptions } from '../types';

/**
 * Find players who have combinations with exactly 5 hits
 */
const findNearWinners = (game: Game) => {
  return game.players
    .filter(player => player.combinations.some(combo => combo.hits === 5))
    .map(player => {
      const nearWinningCombos = player.combinations.filter(combo => combo.hits === 5);
      return { player, combos: nearWinningCombos };
    })
    .filter(item => item.combos.length > 0);
};

/**
 * Draw section title and description
 */
const drawSectionHeader = (
  pdf: jsPDF, 
  options: PdfSectionOptions
): number => {
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
  
  // Increased space before table starts
  return currentY + 20;
};

/**
 * Format a number with a leading zero if needed
 */
const formatNumber = (num: number): string => {
  return String(num).padStart(2, '0');
};

/**
 * Create table data structure for near winners
 */
const createTableData = (
  nearWinners: Array<{player: any, combos: any[]}>,
  drawnNumbersSet: Set<number>
): any[] => {
  const tableData = [];
  
  for (const item of nearWinners) {
    const { player, combos } = item;
    
    // For each combination with 5 hits
    for (const combo of combos) {
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Create a row with player name and formatted numbers
      const row = [
        player.name,
        sortedNumbers.map(num => {
          const isHit = drawnNumbersSet.has(num);
          const formattedNum = formatNumber(num);
          return isHit ? `*${formattedNum}*` : formattedNum;
        }).join(' ')
      ];
      
      tableData.push(row);
    }
  }
  
  return tableData;
};

/**
 * Custom cell renderer for handling asterisk-based highlighting
 */
const cellRenderer = (data: any): void => {
  // Skip if no text content or wrong type
  if (!data?.cell?.text || typeof data.cell.text[0] !== 'string') return;

  const text = String(data.cell.text[0]);
  
  // Look for asterisk markers and replace with styled text
  if (text.includes('*')) {
    const parts = text.split(/\*+/g);
    const styledParts: Array<string | {text: string; style: any}> = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === undefined || parts[i] === null) continue;
      
      // Alternate between regular and highlighted text
      if (i % 2 === 0) {
        // Regular text
        if (parts[i]) styledParts.push(parts[i]);
      } else {
        // Highlighted text (was between asterisks)
        if (parts[i]) {
          styledParts.push({
            text: parts[i],
            style: {
              textColor: [0, 158, 26], // Green color
              fontStyle: 'bold'
            }
          });
        }
      }
    }
    
    // Only replace if we have valid parts
    if (styledParts.length > 0) {
      data.cell.text = styledParts;
    }
  }
};

/**
 * Generate the table for near winners
 */
const generateNearWinnersTable = (
  pdf: jsPDF,
  tableData: any[],
  currentY: number
): number => {
  try {
    if (tableData.length === 0) {
      return currentY;
    }
    
    autoTable(pdf, {
      startY: currentY,
      head: [['Jogador', 'Sequência (5 acertos)']],
      body: tableData,
      theme: 'striped',
      styles: {
        overflow: 'linebreak',
        cellPadding: 5,
        fontSize: 11, // Slightly larger for better readability
        textColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 12, // Slightly larger for header
      },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' }, // Fixed width for player names
        1: { cellWidth: 'auto', halign: 'left' }  // Auto width for sequences
      },
      didParseCell: cellRenderer,
      margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
      tableLineWidth: 0.2,
      tableLineColor: [200, 200, 200],
      alternateRowStyles: {
        fillColor: [248, 248, 248]  // Light gray for alternating rows
      },
    });
    
    // Get final Y position and add more space after table
    const finalY = (pdf as any).lastAutoTable.finalY + 20; // More space after table
    return finalY;
  } catch (error) {
    console.error("Error generating near winners table:", error);
    return currentY + 20; // Return a safe position in case of error
  }
};

// Main function that adds the near winners section to the PDF
export const addNearWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  options: PdfSectionOptions = { color: '#39FF14' }
): number => {
  try {
    const drawnNumbersSet = new Set(allDrawnNumbers);
    
    // Find players with combinations that have exactly 5 hits
    const nearWinners = findNearWinners(game);
      
    // If no near winners, return current position
    if (nearWinners.length === 0) {
      return PDF_CONFIG.margin + 30;
    }
    
    // Draw section header
    const currentY = drawSectionHeader(pdf, options);
    
    // Create table data
    const tableData = createTableData(nearWinners, drawnNumbersSet);
    
    // Generate table and return final Y position
    return generateNearWinnersTable(pdf, tableData, currentY);
  } catch (error) {
    console.error("Error in addNearWinnersSection:", error);
    return PDF_CONFIG.margin + 30; // Return a safe position in case of error
  }
};
