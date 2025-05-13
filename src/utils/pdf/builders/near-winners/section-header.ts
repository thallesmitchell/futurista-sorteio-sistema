
import jsPDF from 'jspdf';

/**
 * Add the section header for near winners
 */
export function addNearWinnersSectionHeader(doc: jsPDF, hitCount: number): void {
  doc.addPage();
  
  // Set font styles for the header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  
  // Add the header text
  doc.text(
    `Jogos Amarrados - ${hitCount} Acertos`, 
    doc.internal.pageSize.width / 2, 
    20, 
    { align: 'center' }
  );
  
  // Add explanation text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Jogadores que estão a 1 acerto de ganhar`, 
    doc.internal.pageSize.width / 2, 
    30, 
    { align: 'center' }
  );
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}
