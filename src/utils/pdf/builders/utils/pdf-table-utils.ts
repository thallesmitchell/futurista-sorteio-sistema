
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { PDFOptions, PdfSectionOptions } from '../../types';

// Draw a table with the given data
export function drawTable(
  doc: jsPDF,
  columns: { header: string, dataKey: string }[],
  data: any[],
  startY: number,
  options: any = {}
): number {
  // Convert data to format expected by autoTable
  const tableData = data.map(row => {
    // Handle both array data and object data
    if (Array.isArray(row)) {
      return row;
    } else {
      return columns.map(col => row[col.dataKey] || '');
    }
  });

  // Create column headers
  const headers = columns.map(col => col.header || '');

  // Setup table options
  const tableOptions = {
    startY,
    head: [headers],
    body: tableData,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold' as 'bold' // Type assertion to match FontStyle
    },
    theme: 'grid' as const, // Fix type issue with theme
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    ...options
  };
  
  // Create the table
  autoTable(doc, tableOptions);
  
  // Return the position after the table
  return (doc as any).lastAutoTable.finalY;
}

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
      fontStyle: 'bold' as 'bold' // Type assertion to match FontStyle
    },
    theme: 'grid' as const, // Fix type issue with theme
    styles: {
      fontSize: 10,
      cellPadding: 3,
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

// Add a section header with the theme color
export function addSectionHeader(
  doc: jsPDF,
  title: string,
  yPosition: number
): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, yPosition);
  return yPosition + 8;
}

// Add a subtitle under a section header
export function addSubtitle(
  doc: jsPDF,
  text: string,
  yPosition: number
): number {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(text, 14, yPosition);
  return yPosition + 6;
}
