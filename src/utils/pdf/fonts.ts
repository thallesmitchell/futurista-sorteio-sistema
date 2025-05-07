
import { jsPDF } from 'jspdf';
import interRegular from '@/assets/fonts/Inter-Regular.ttf';
import interBold from '@/assets/fonts/Inter-Bold.ttf';
import interMedium from '@/assets/fonts/Inter-Medium.ttf';
import interItalic from '@/assets/fonts/Inter-Italic.ttf';

// Function to load font files
export const loadFonts = async (pdf: jsPDF): Promise<void> => {
  try {
    // Load Inter fonts
    await Promise.all([
      loadFont(interRegular),
      loadFont(interBold),
      loadFont(interMedium),
      loadFont(interItalic)
    ]);
    
    console.log('All fonts loaded successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error loading fonts:', error);
    return Promise.reject(error);
  }
};

// Load a single font
const loadFont = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  return response.arrayBuffer();
};

// Add loaded fonts to the PDF document
export const addFonts = (pdf: jsPDF): void => {
  try {
    pdf.addFont(interRegular, 'Inter-Regular', 'normal', 'WinAnsiEncoding');
    pdf.addFont(interBold, 'Inter-Bold', 'bold', 'WinAnsiEncoding');
    pdf.addFont(interMedium, 'Inter-Medium', 'medium', 'WinAnsiEncoding');
    pdf.addFont(interItalic, 'Inter-Italic', 'italic', 'WinAnsiEncoding');
    
    pdf.setFont('Inter-Regular');
  } catch (error) {
    console.error('Error adding fonts to PDF:', error);
  }
};
