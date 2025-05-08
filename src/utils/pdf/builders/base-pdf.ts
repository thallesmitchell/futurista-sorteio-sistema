
import jsPDF from 'jspdf';
import { formatDate } from '@/lib/date';

/**
 * PDF generation configuration with standard A4 dimensions
 * and consistent font sizes for different elements
 */
export const PDF_CONFIG = {
  pageWidth: 210,       // A4 width in mm
  pageHeight: 297,      // A4 height in mm
  margin: 15,           // Page margins
  fontSizes: {
    title: 19,          // Main title size
    subtitle: 17,       // Section titles
    normal: 13,         // Regular text
    small: 11           // Small text
  },
  lineHeight: 7,        // Standard line height
  innerMargin: 5,       // Inner spacing
};

/**
 * Initialize a new PDF document with proper setup
 * @returns jsPDF A properly initialized PDF document
 */
export const createPDF = (): jsPDF => {
  // Create new document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true, // Optimize PDF size
  });
  
  // Set white background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F');
  
  return pdf;
};

/**
 * Add standard header section to PDF
 * @param pdf The PDF document
 * @param gameTitle Title of the game to display
 * @param date Date to display (defaults to current date)
 * @param options Additional options including text color
 * @returns The Y position after adding the header
 */
export const addHeader = (
  pdf: jsPDF, 
  gameTitle: string, 
  date: Date | string | null | undefined = new Date(), 
  options = { color: '#000000' }
): number => {
  let yPosition = PDF_CONFIG.margin;
  
  // Add title in bold
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.title);
  pdf.setTextColor(options.color);
  pdf.text("Resultado", PDF_CONFIG.pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += PDF_CONFIG.lineHeight;
  
  // Format and add date
  let formattedDate = "Data indisponível";
  try {
    // Usar formatação personalizada para dia e mês
    if (date instanceof Date || typeof date === 'string') {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!isNaN(dateObj.getTime())) {
        const day = String(dateObj.getDate()).padStart(2, '0');
        
        // Meses em português (abreviados)
        const monthsShort = [
          'jan', 'fev', 'mar', 'abr', 'maio', 'jun', 
          'jul', 'ago', 'set', 'out', 'nov', 'dez'
        ];
        const month = monthsShort[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        
        formattedDate = `${day}/${month}/${year}`;
      }
    } else {
      formattedDate = formatDate(date);
    }
  } catch (error) {
    console.error('Error formatting date in addHeader:', error);
  }
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.text(formattedDate, PDF_CONFIG.pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += PDF_CONFIG.lineHeight;
  
  // Add game name - ensure gameTitle is a string
  const safeTitleText = typeof gameTitle === 'string' ? gameTitle : 'Jogo sem nome';
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(PDF_CONFIG.fontSizes.normal);
  pdf.text(safeTitleText, PDF_CONFIG.pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += PDF_CONFIG.lineHeight;
  
  // Add separator line
  pdf.setDrawColor(options.color);
  pdf.line(
    PDF_CONFIG.margin, 
    yPosition, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
    yPosition
  );
  
  return yPosition + 10;
};
