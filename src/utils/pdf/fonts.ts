
import { jsPDF } from 'jspdf';

/**
 * Load standard fonts for PDF generation
 * Using built-in fonts for maximum compatibility
 */
export const loadFonts = async (pdf: jsPDF): Promise<void> => {
  // We use the standard fonts available in jsPDF for compatibility
  console.log('Using standard fonts for PDF generation');
  return Promise.resolve();
};

/**
 * Add standard fonts to the PDF document
 */
export const addFonts = (pdf: jsPDF): void => {
  try {
    // Use standard Helvetica font that's built into jsPDF
    pdf.setFont('helvetica');
    console.log('Successfully set helvetica font for PDF');
  } catch (error) {
    console.error('Error setting fonts in PDF:', error);
    // Fallback to default font
    pdf.setFont('Helvetica');
  }
};
