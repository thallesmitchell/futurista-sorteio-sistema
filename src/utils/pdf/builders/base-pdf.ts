
import jsPDF from 'jspdf';
import { addFonts, loadFonts } from '../fonts';
import { formatDate } from '@/lib/date';

// PDF generation configuration
export const PDF_CONFIG = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margin: 15,
  titleFontSize: 18,
  subtitleFontSize: 14,
  headerFontSize: 12,
  textFontSize: 10,
  smallTextFontSize: 8,
  lineHeight: 7,
  innerMargin: 5,
  ballSize: 9, // Base ball size
}

// Initialize PDF document
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
  const textWidth = pdf.getStringUnitWidth(`${gameTitle}`) * PDF_CONFIG.titleFontSize / pdf.internal.scaleFactor;
  const centerX = (PDF_CONFIG.pageWidth - textWidth) / 2;

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

// Create a ball with number
export const drawBall = (
  pdf: jsPDF, 
  x: number, 
  y: number, 
  number: number, 
  options = { 
    size: PDF_CONFIG.ballSize, 
    colorFill: '#39FF14',
    colorBorder: '#39FF14',
    colorText: '#FFFFFF',
    isHit: true
  }
): void => {
  const radius = options.size;
  const formattedNumber = String(number).padStart(2, '0');
  
  // If hit, fill with color, otherwise just border
  if (options.isHit) {
    pdf.setFillColor(options.colorFill);
    pdf.circle(x, y, radius, 'F');
    pdf.setTextColor(options.colorText);
    pdf.setFont('helvetica', 'bold'); // Bold for hit numbers
  } else {
    pdf.setDrawColor(options.colorBorder);
    pdf.circle(x, y, radius, 'D');
    pdf.setTextColor(options.colorBorder);
    pdf.setFont('helvetica', 'normal'); // Normal weight for non-hits
  }
  
  // Add number to ball
  pdf.setFontSize(PDF_CONFIG.smallTextFontSize);
  
  // Calculate text width to center within ball
  const textWidth = pdf.getStringUnitWidth(formattedNumber) * PDF_CONFIG.smallTextFontSize / pdf.internal.scaleFactor;
  const textX = x - (textWidth / 2);
  
  // Center text vertically and horizontally in ball
  pdf.text(formattedNumber, textX, y + 1.5);
}
