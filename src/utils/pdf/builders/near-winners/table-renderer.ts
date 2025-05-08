
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_CONFIG } from '../base-pdf';
import { highlightedCellRenderer, getStandardTableStyles } from '../utils/pdf-table-utils';

// Define types to match jsPDF-autotable's accepted values
type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';
type HAlignType = 'left' | 'center' | 'right' | 'justify';

/**
 * Generate the table for near winners
 */
export const generateNearWinnersTable = (
  pdf: jsPDF,
  tableData: string[][],
  currentY: number
): number => {
  try {
    if (!tableData || tableData.length === 0) {
      console.log('No near winners data to display in table');
      return currentY;
    }
    
    console.log(`Rendering near winners table with ${tableData.length} rows`);
    
    // Debug print each row for troubleshooting
    tableData.forEach((row, index) => {
      console.log(`Table row ${index}:`, JSON.stringify(row));
    });
    
    const tableStyles = getStandardTableStyles();
    
    // Ensure table data is in the correct format
    autoTable(pdf, {
      startY: currentY,
      head: [['Jogador', 'Sequência (5 acertos)']],
      body: tableData,
      theme: 'striped',
      ...tableStyles,
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' as FontStyle },
        1: { cellWidth: 'auto', halign: 'left' as HAlignType }
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
