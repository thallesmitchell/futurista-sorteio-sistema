
import jsPDF from 'jspdf';
import { addFonts, loadFonts } from '../fonts';
import { formatDate } from '@/lib/date';

/**
 * PDF generation configuration with standard A4 dimensions
 * and consistent font sizes for different elements
 */
export const PDF_CONFIG = {
  pageWidth: 210,       // A4 width in mm
  pageHeight: 297,      // A4 height in mm
  margin: 15,           // Page margins
  titleFontSize: 18,    // Main title size
  subtitleFontSize: 14, // Section titles
  headerFontSize: 12,   // Headers
  textFontSize: 10,     // Regular text
  smallTextFontSize: 8, // Small text
  lineHeight: 7,        // Line height
  innerMargin: 5,       // Inner spacing
}

/**
 * Initialize a new PDF document with proper setup
 * @returns Promise<jsPDF> A properly initialized PDF document
 */
export const createPDF = async (): Promise<jsPDF> => {
  // Create new document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true, // Optimize PDF size
  });
  
  // Load and register fonts
  await loadFonts(pdf);
  addFonts(pdf);
  
  // Set white background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F');
  
  return pdf;
}

/**
 * Add standard header section to PDF
 * @param pdf The PDF document
 * @param gameTitle Title of the game to display
 * @param date Date to display (defaults to current date)
 * @param options Additional options including text color
 */
export const addHeader = (
  pdf: jsPDF, 
  gameTitle: string, 
  date: Date | string | null | undefined = new Date(), 
  options = { color: '#000000' }
): void => {
  let formattedDate: string;
  
  try {
    formattedDate = formatDate(date);
  } catch (error) {
    console.error('Error formatting date in addHeader:', error);
    formattedDate = 'Data indisponível';
  }
  
  // Add title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.titleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Resultado', PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin, { align: 'center' });
  
  // Add date
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.text(formattedDate, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin + 10, { align: 'center' });
  
  // Add game name - ensure gameTitle is a string
  const safeTitleText = typeof gameTitle === 'string' ? gameTitle : 'Jogo sem nome';
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.headerFontSize);
  pdf.text(safeTitleText, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin + 20, { align: 'center' });
  
  // Add separator line
  pdf.setDrawColor(options.color);
  pdf.line(
    PDF_CONFIG.margin, 
    PDF_CONFIG.margin + 25, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
    PDF_CONFIG.margin + 25
  );
}
