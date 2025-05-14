
import jsPDF from 'jspdf';
import { PDF_CONFIG } from '../base-pdf';

/**
 * Format a number with a leading zero if needed
 */
export const formatNumber = (num: number): string => {
  return String(num).padStart(2, '0');
};

// Define types to match jsPDF-autotable's accepted values
type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';
type HAlignType = 'left' | 'center' | 'right' | 'justify';
type VAlignType = 'top' | 'middle' | 'bottom';
type OverflowType = 'linebreak' | 'ellipsize' | 'visible' | 'hidden';

/**
 * Standard table styles that can be reused across PDF tables
 */
export const getStandardTableStyles = () => {
  return {
    styles: {
      overflow: 'linebreak' as OverflowType,
      cellPadding: 5,
      fontSize: 11,
      textColor: [0, 0, 0] as [number, number, number],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240] as [number, number, number],
      textColor: [0, 0, 0] as [number, number, number],
      fontStyle: 'bold' as FontStyle,
      halign: 'left' as HAlignType,
      fontSize: 12,
    },
    margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
    tableLineWidth: 0.2,
    tableLineColor: [200, 200, 200] as [number, number, number],
    alternateRowStyles: {
      fillColor: [248, 248, 248] as [number, number, number]
    },
  };
};

/**
 * Draw custom text with mixed styles in a PDF
 * This utility helps create text with different styles within the same line
 */
export const drawStyledText = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  hitColor: [number, number, number] = [0, 158, 26]
) => {
  // Check if text contains highlighting markers
  if (!text.includes('*')) {
    pdf.text(text, x, y);
    return;
  }
  
  // Split by spaces first to get individual number tokens
  const parts = text.split(' ');
  let currentX = x;
  
  for (const part of parts) {
    // Check if this part needs highlighting
    const isHighlighted = part.startsWith('*') && part.endsWith('*');
    
    // Clean the text from asterisks
    const cleanText = part.replace(/\*/g, '');
    
    // Set appropriate style
    if (isHighlighted) {
      pdf.setTextColor(hitColor[0], hitColor[1], hitColor[2]);
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
    }
    
    // Draw this text part
    pdf.text(cleanText, currentX, y);
    
    // Advance X position
    currentX += pdf.getTextWidth(cleanText) + 3; // 3px spacing
  }
  
  // Reset text color and font
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
};

/**
 * Add a subtitle to the PDF document
 */
export const addSubtitle = (
  doc: jsPDF,
  text: string,
  fontSize: number = 14,
  y?: number
): number => {
  const yPos = y || (doc.previousAutoTable?.finalY || PDF_CONFIG.margin) + 15;
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(text, PDF_CONFIG.margin, yPos);
  
  // Reset font settings
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  
  return yPos + 10; // Return position after title for next content
};

/**
 * Create a table header with specified columns
 */
export const createTableHeader = (columns: string[]): string[][] => {
  return [columns];
};
