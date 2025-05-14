
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { PDFOptions, PdfSectionOptions } from '../../types';

// Common function to create a table header with consistent styling
export function addTableHeader(
  doc: jsPDF,
  text: string,
  yPosition: number,
  options: PdfSectionOptions
): number {
  // Set text color to the theme color
  doc.setTextColor(options.color || '#39FF14');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  
  // Add the header text
  doc.text(text, 14, yPosition);
  
  // Draw a line under the header
  const textWidth = doc.getTextWidth(text);
  doc.setDrawColor(options.color || '#39FF14');
  doc.setLineWidth(0.5);
  doc.line(14, yPosition + 2, 14 + textWidth + 10, yPosition + 2);
  
  // Return the position after the header
  return yPosition + 8;
}

// Create simple table for data display with consistent styling
export function createSimpleTable(
  doc: jsPDF,
  headers: string[],
  data: string[][],
  yPosition: number,
  options: PdfSectionOptions
): number {
  // Define table style based on options
  const tableOptions = {
    startY: yPosition,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      // Add specific column styles if needed
    }
  };
  
  // Create the table
  autoTable(doc, {
    head: [headers],
    body: data,
    ...tableOptions,
  });
  
  // Return the position after the table
  return (doc as any).lastAutoTable.finalY + 10;
}
