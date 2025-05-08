
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_CONFIG } from '../base-pdf';
import { highlightedCellRenderer, getStandardTableStyles } from '../utils/pdf-table-utils';

/**
 * Generate the table for near winners
 */
export const generateNearWinnersTable = (
  pdf: jsPDF,
  tableData: any[],
  currentY: number
): number => {
  try {
    if (tableData.length === 0) {
      return currentY;
    }
    
    const tableStyles = getStandardTableStyles();
    
    autoTable(pdf, {
      startY: currentY,
      head: [['Jogador', 'Sequência (5 acertos)']],
      body: tableData,
      theme: 'striped',
      ...tableStyles,
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' }, // Fixed width for player names
        1: { cellWidth: 'auto', halign: 'left' }  // Auto width for sequences
      },
      didParseCell: highlightedCellRenderer,
    });
    
    // Get final Y position and add more space after table
    const finalY = (pdf as any).lastAutoTable.finalY + 20; // More space after table
    return finalY;
  } catch (error) {
    console.error("Error generating near winners table:", error);
    return currentY + 20; // Return a safe position in case of error
  }
};
