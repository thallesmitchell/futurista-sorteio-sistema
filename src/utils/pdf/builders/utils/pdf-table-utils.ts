
import jsPDF from 'jspdf';
import { PDF_CONFIG } from '../base-pdf';

/**
 * Format a number with a leading zero if needed
 */
export const formatNumber = (num: number): string => {
  return String(num).padStart(2, '0');
};

/**
 * Custom cell renderer for handling asterisk-based highlighting
 * This can be used across different table implementations
 */
export const highlightedCellRenderer = (data: any): void => {
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
              textColor: [0, 158, 26] as [number, number, number], // Properly typed as RGB tuple
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

// Define FontStyle type to match jsPDF-autotable's accepted values
type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

/**
 * Standard table styles that can be reused across PDF tables
 */
export const getStandardTableStyles = () => {
  return {
    styles: {
      overflow: 'linebreak' as 'linebreak', // Properly typed as literal type
      cellPadding: 5,
      fontSize: 11,
      textColor: [0, 0, 0] as [number, number, number], // Properly typed as RGB tuple
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240] as [number, number, number], // Properly typed as RGB tuple
      textColor: [0, 0, 0] as [number, number, number], // Properly typed as RGB tuple
      fontStyle: 'bold' as FontStyle, // Explicitly typed as FontStyle
      halign: 'left',
      fontSize: 12,
    },
    margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
    tableLineWidth: 0.2,
    tableLineColor: [200, 200, 200] as [number, number, number], // Properly typed as RGB tuple
    alternateRowStyles: {
      fillColor: [248, 248, 248] as [number, number, number] // Properly typed as RGB tuple
    },
  };
};
