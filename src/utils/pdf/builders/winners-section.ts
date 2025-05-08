
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';

/**
 * Add game winners to the PDF with an enhanced futuristic design
 * @param pdf The PDF document
 * @param game The game data
 * @param yPosition The current Y position
 * @returns The new Y position
 */
export const addWinnersSection = (
  pdf: jsPDF, 
  game: Game,
  yPosition: number
): number => {
  if (!game.winners || !Array.isArray(game.winners) || game.winners.length === 0) {
    console.log('No winners to display in PDF');
    return yPosition;
  }
  
  console.log(`Adding ${game.winners.length} winners to PDF with enhanced design`);
  
  // Create a light green background for the winners section
  pdf.setFillColor(230, 250, 240);
  pdf.roundedRect(
    PDF_CONFIG.margin - 5, 
    yPosition - 5, 
    PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2) + 10, 
    (game.winners.length * (PDF_CONFIG.lineHeight * 5)) + 40, 
    4, 
    4, 
    'F'
  );
  
  // Add a decorative border with gradient effect
  const borderColors = [
    [0, 158, 26], // Green
    [0, 200, 83], // Light Green
    [0, 230, 118], // Bright Green
  ];
  
  // Draw multiple border lines with decreasing opacity for gradient effect
  for (let i = 0; i < 3; i++) {
    pdf.setDrawColor(borderColors[i][0], borderColors[i][1], borderColors[i][2]);
    pdf.setLineWidth(3 - i);
    pdf.roundedRect(
      PDF_CONFIG.margin - 5 + i, 
      yPosition - 5 + i, 
      PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2) + 10 - (i*2), 
      (game.winners.length * (PDF_CONFIG.lineHeight * 5)) + 40 - (i*2), 
      4, 
      4, 
      'S'
    );
  }
  
  // Winners title with futuristic design
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle * 1.2);
  
  // Create a radial gradient effect for the title
  const centerX = PDF_CONFIG.pageWidth / 2;
  pdf.setTextColor(0, 158, 26); // Green
  pdf.text("GANHADORES", centerX, yPosition + 10, { align: "center" });
  
  // Add a trophy symbol
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle * 1.5);
  pdf.text("🏆", centerX - 50, yPosition + 10);
  pdf.text("🏆", centerX + 50, yPosition + 10);
  
  yPosition += PDF_CONFIG.lineHeight * 2.5;
  
  // Add each winner with enhanced styling
  let winnerCount = 0;
  for (const winner of game.winners) {
    try {
      const playerData = game.players.find(p => p.id === winner.id);
      if (!playerData) {
        console.log(`Winner player data not found for id: ${winner.id}`);
        continue;
      }
      
      winnerCount++;
      console.log(`Adding winner ${winnerCount}: ${playerData.name}`);
      
      // Background for each winner entry
      pdf.setFillColor(220, 250, 230);
      pdf.roundedRect(
        PDF_CONFIG.margin, 
        yPosition - 3, 
        PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2), 
        PDF_CONFIG.lineHeight * 4, 
        3, 
        3, 
        'F'
      );
      
      // Add winner name with futuristic styling
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(PDF_CONFIG.fontSizes.normal + 2);
      pdf.setTextColor(0, 100, 0); // Dark Green
      pdf.text(`${winnerCount}. ${playerData.name}`, PDF_CONFIG.margin + 5, yPosition + 5);
      
      yPosition += PDF_CONFIG.lineHeight * 1.2;
      
      // Find winning combinations
      const winningCombos = playerData.combinations.filter(c => c.hits === 6);
      console.log(`Found ${winningCombos.length} winning combinations`);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(PDF_CONFIG.fontSizes.normal);
      pdf.setTextColor(0, 0, 0);
      
      // Add each combination with number badges
      for (const combo of winningCombos) {
        if (!combo.numbers || !Array.isArray(combo.numbers)) {
          console.log('Invalid combination numbers');
          continue;
        }
        
        // Numbers with badge style
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        const startX = PDF_CONFIG.margin + 15;
        
        pdf.text("Números vencedores:", PDF_CONFIG.margin + 5, yPosition);
        yPosition += PDF_CONFIG.lineHeight;
        
        // Draw number badges
        for (let i = 0; i < sortedNumbers.length; i++) {
          const num = sortedNumbers[i];
          const numString = String(num).padStart(2, '0');
          const x = startX + (i * 25);
          
          // Draw badge background
          pdf.setFillColor(0, 158, 26); // Green
          pdf.circle(x + 8, yPosition - 3, 8, 'F');
          
          // Draw number on badge
          pdf.setTextColor(255, 255, 255); // White
          pdf.setFont("helvetica", "bold");
          pdf.text(numString, x + 8 - (numString.length * 2), yPosition);
        }
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
        
        yPosition += PDF_CONFIG.lineHeight * 1.5;
      }
      
      yPosition += PDF_CONFIG.lineHeight;
    } catch (error) {
      console.error("Error processing winner:", error);
      continue;
    }
  }
  
  // Add a decorative footer to the winners section
  pdf.setFillColor(0, 158, 26, 0.2); // Light Green with transparency
  pdf.rect(PDF_CONFIG.margin, yPosition, PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2), 2, 'F');
  
  return yPosition + 15;
};
