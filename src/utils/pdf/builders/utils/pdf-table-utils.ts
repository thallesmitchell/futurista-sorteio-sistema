
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
  try {
    // Skip if cell has no text content
    if (!data?.cell?.text || data.cell.text.length === 0) return;
    
    // Ensure we're working with a string
    let textContent = data.cell.text[0];
    if (typeof textContent !== 'string') {
      textContent = String(textContent);
    }
    
    // Check if the text contains asterisks for highlighting
    if (!textContent.includes('*')) return;
    
    console.log(`Processing cell with highlighted text: ${textContent}`);
    
    // Split string by asterisks to separate highlighted parts
    const parts = textContent.split(/\*+/);
    const styledParts = [];
    
    let isHighlighted = false;
    for (const part of parts) {
      // Skip empty parts
      if (part === '') {
        isHighlighted = !isHighlighted;
        continue;
      }
      
      if (isHighlighted) {
        // This part should be highlighted (was between asterisks)
        styledParts.push({
          text: part,
          style: {
            textColor: [0, 158, 26],  // Green color for hits
            fontStyle: 'bold'
          }
        });
      } else {
        // Regular text
        styledParts.push(part);
      }
      
      isHighlighted = !isHighlighted;
    }
    
    // Only replace if we have valid parts
    if (styledParts.length > 0) {
      data.cell.text = styledParts;
      console.log(`Styled parts created: ${styledParts.length}`);
    }
  } catch (error) {
    console.error('Error in highlightedCellRenderer:', error);
    // Don't modify the cell if there's an error
  }
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
