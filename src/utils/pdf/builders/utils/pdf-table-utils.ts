
import jsPDF from 'jspdf';
import { autoTable, RowInput, ColumnInput } from 'jspdf-autotable';
import { PdfTableOptions, TableSectionOptions } from '../../types';

/**
 * Add a title to the PDF
 */
export const addTitle = (doc: jsPDF, text: string, fontSize: number = 16) => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  const textWidth = doc.getTextWidth(text);
  const pageWidth = doc.internal.pageSize.getWidth();
  const x = (pageWidth - textWidth) / 2;
  doc.text(text, x, 20);
  return 20 + fontSize / 2; // Return the y position after the title
};

/**
 * Add a subtitle to the PDF
 */
export const addSubtitle = (doc: jsPDF, text: string, y: number, fontSize: number = 12) => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'italic');
  const textWidth = doc.getTextWidth(text);
  const pageWidth = doc.internal.pageSize.getWidth();
  const x = (pageWidth - textWidth) / 2;
  doc.text(text, x, y + 8);
  return y + 8 + fontSize / 2; // Return the y position after the subtitle
};

/**
 * Add a section header to the PDF
 */
export const addSectionHeader = (doc: jsPDF, text: string, y: number, fontSize: number = 14) => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 14, y);
  return y + fontSize / 2; // Return the y position after the section header
};

/**
 * Draw a table in the PDF
 */
export const drawTable = (
  doc: jsPDF, 
  head: ColumnInput[], 
  body: RowInput[], 
  y: number,
  options: PdfTableOptions = {}
) => {
  const defaultOptions = {
    startY: y + 5,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { top: 10 },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'auto',
      cellPadding: 4,
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  autoTable(doc, {
    head: [head],
    body: body,
    ...mergedOptions
  });

  // Return the position after the table
  return (doc as any).lastAutoTable.finalY;
};

/**
 * Render a table section with header
 */
export const renderTableSection = async (
  doc: jsPDF, 
  options: TableSectionOptions
) => {
  const { 
    title, 
    columns, 
    data, 
    y,
    subtitle,
    tableOptions
  } = options;

  let currentY = y;
  
  // Add section header
  if (title) {
    currentY = addSectionHeader(doc, title, currentY);
  }
  
  // Add subtitle if provided
  if (subtitle) {
    currentY = addSubtitle(doc, subtitle, currentY);
  }

  // Check if we need a page break
  const pageHeight = doc.internal.pageSize.height;
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = 20;
    
    // Re-add title on new page if title exists
    if (title) {
      currentY = addSectionHeader(doc, title, currentY);
    }
  }

  // Skip the table if we have no data
  if (!data || data.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No data available for this section.', 14, currentY + 10);
    return currentY + 20;
  }

  // Draw the table
  const finalY = drawTable(doc, columns, data, currentY, tableOptions);
  
  // Add 10 units of padding after the table
  return finalY + 10;
};

/**
 * Format a date for display
 */
export const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' -');
  } catch (e) {
    return dateStr;
  }
};
