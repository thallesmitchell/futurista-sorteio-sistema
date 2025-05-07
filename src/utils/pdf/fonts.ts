
import { jsPDF } from 'jspdf';

// Function to load font files
export const loadFonts = async (pdf: jsPDF): Promise<void> => {
  // We'll use the default fonts available in jsPDF instead of trying to load custom fonts
  console.log('Using default fonts instead of custom Inter fonts');
  return Promise.resolve();
};

// Add standard fonts to the PDF document
export const addFonts = (pdf: jsPDF): void => {
  try {
    // Use the default Helvetica font that's built into PDF
    pdf.setFont('helvetica');
  } catch (error) {
    console.error('Error setting fonts in PDF:', error);
  }
};
