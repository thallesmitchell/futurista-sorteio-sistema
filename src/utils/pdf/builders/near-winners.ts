
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
  
  return currentY + 15;
};

/**
 * Format a number with a leading zero if needed
 */
const formatNumber = (num: number): string => {
  return String(num).padStart(2, '0');
};

/**
 * Process near winner data and create table rows
 */
const createTableRows = (
  nearWinners: Array<{player: any, combos: any[]}>,
  drawnNumbersSet: Set<number>,
  options: PdfSectionOptions
): any[] => {
  const tableRows = [];
  
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
    
    // Show combinations for this player (limit to specified max)
    const maxCombos = options.maxCombosPerPlayer || 3;
    const combosToShow = item.combos.slice(0, maxCombos);
    
    // Process each combo separately
    combosToShow.forEach(combo => {
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Format numbers safely
      const numbersText = formatNumbersWithHits(sortedNumbers, drawnNumbersSet);
      
      // Add the row with plain text
      tableRows.push([{
        content: numbersText,
        colSpan: 1,
        styles: { halign: 'center' }
      }]);
    });
    
    // If there are more combinations than shown
    if (item.combos.length > maxCombos) {
      const remainingCount = item.combos.length - maxCombos;
      tableRows.push([{
        content: `+ ${remainingCount} mais sequência${remainingCount !== 1 ? 's' : ''} com 5 acertos`,
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
  
  return tableRows;
};

/**
 * Format numbers with hit highlighting using asterisks
 */
const formatNumbersWithHits = (
  numbers: number[], 
  drawnNumbersSet: Set<number>
): string => {
  return numbers.map((num, idx) => {
    const isHit = drawnNumbersSet.has(num);
    const formattedNum = formatNumber(num);
    
    // Return formatted number with or without highlighting
    return isHit ? `*${formattedNum}*` : formattedNum;
  }).join(' ');
};

/**
 * Custom cell renderer for handling asterisks highlighting
 */
const cellRenderer = (data: any): void => {
  // Skip if no text content
  if (!data?.cell?.text || !data.cell.text[0]) return;
  
  try {
    // Make sure we're working with a string
    const text = String(data.cell.text[0] || '');
    
    // Look for asterisk markers and replace with styled text
    if (text.includes('*')) {
      const parts = text.split(/\*+/g);
      const styledParts: Array<string | {text: string; style: any}> = [];
      
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
    console.error("Error in cell renderer:", error);
    // Ensure text is a simple string in case of errors
    data.cell.text = ['Error processing cell'];
  }
};

/**
 * Generate the table for near winners
 */
const generateNearWinnersTable = (
  pdf: jsPDF,
  tableRows: any[],
  currentY: number
): number => {
  try {
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
      // Cell renderer that handles asterisks for highlighting
      didParseCell: cellRenderer,
      margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
      tableLineWidth: 0.2,
      tableLineColor: [200, 200, 200]
    });
    
    // Get final Y position
    const finalY = (pdf as any).lastAutoTable.finalY + 15;
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
    
    // Create table rows
    const tableRows = createTableRows(nearWinners, drawnNumbersSet, options);
    
    // Generate table and return final Y position
    return generateNearWinnersTable(pdf, tableRows, currentY);
  } catch (error) {
    console.error("Error in addNearWinnersSection:", error);
    return PDF_CONFIG.margin + 30; // Return a safe position in case of error
  }
};
