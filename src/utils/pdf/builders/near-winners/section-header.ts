
import jsPDF from 'jspdf';
import { PDF_CONFIG } from '../base-pdf';
import { PdfSectionOptions } from '../../types';

/**
 * Draw section title and description
 */
export const drawNearWinnersHeader = (
  pdf: jsPDF, 
  options: PdfSectionOptions
): number => {
  // Section title
  let currentY = PDF_CONFIG.margin + 35;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(options.color);
  pdf.text("Jogos Amarrados", PDF_CONFIG.pageWidth / 2, currentY, { align: "center" });
  
  currentY += 10;
  
  // Description
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(PDF_CONFIG.fontSizes.normal);
  pdf.setTextColor('#000000');
  pdf.text(
    'Jogadores com 5 acertos (falta apenas 1 número para ganhar)',
    PDF_CONFIG.pageWidth / 2, 
    currentY,
    { align: 'center' }
  );
  
  // Increased space before table starts
  return currentY + 20;
};
