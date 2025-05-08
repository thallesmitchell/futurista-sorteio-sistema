
import jsPDF from 'jspdf';
import { addFonts, loadFonts } from '../fonts';
import { formatDate } from '@/lib/date';

// PDF generation configuration
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

// Initialize PDF document with white background
export const createPDF = async (): Promise<jsPDF> => {
  // Create new document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Load and register fonts
  await loadFonts(pdf);
  addFonts(pdf);
  
  return pdf;
}

// Add header section to PDF
export const addHeader = (
  pdf: jsPDF, 
  gameTitle: string, 
  date: Date | string = new Date(), 
  options = { color: '#000000' }
): void => {
  const formattedDate = typeof date === 'string' ? date : formatDate(date);
  
  // Add title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.titleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Resultado', PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin, { align: 'center' });
  
  // Add date
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.text(formattedDate, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin + 10, { align: 'center' });
  
  // Add game name
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.headerFontSize);
  pdf.text(gameTitle, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin + 20, { align: 'center' });
  
  // Add separator line
  pdf.setDrawColor(options.color);
  pdf.line(
    PDF_CONFIG.margin, 
    PDF_CONFIG.margin + 25, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
    PDF_CONFIG.margin + 25
  );
}
