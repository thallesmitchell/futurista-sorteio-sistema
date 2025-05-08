
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';

/**
 * Add game winners to the PDF with a more proportionate futuristic design
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
  
  console.log(`Adding ${game.winners.length} winners to PDF with balanced design`);
  
  // Create a light green background for the winners section
  pdf.setFillColor(230, 250, 240);
  pdf.roundedRect(
    PDF_CONFIG.margin, 
    yPosition, 
    PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2), 
    (game.winners.length * (PDF_CONFIG.lineHeight * 4)) + 15, 
    3, 
    3, 
    'F'
  );
  
  // Add a decorative border with green color
  pdf.setDrawColor(0, 158, 26); // Green
  pdf.setLineWidth(0.5);
  pdf.roundedRect(
    PDF_CONFIG.margin, 
    yPosition, 
    PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2), 
    (game.winners.length * (PDF_CONFIG.lineHeight * 4)) + 15, 
    3, 
    3, 
    'S'
  );
  
  // Winners title with balanced design
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(0, 130, 20); // Green
  
  // Add title
  const titleY = yPosition + PDF_CONFIG.lineHeight;
  pdf.text("GANHADORES", PDF_CONFIG.pageWidth / 2, titleY, { align: "center" });
  
  // Draw trophy icons (vector shapes) instead of emoji
  const drawTrophy = (x: number, y: number, size: number = 3) => {
    // Trophy base
    pdf.setFillColor(200, 170, 0); // Gold color
    pdf.roundedRect(x - size/2, y - size*1.5, size, size*2, size/3, size/3, 'F');
    
    // Trophy cup
    pdf.circle(x, y - size*2, size/1.5, 'F');
    
    // Trophy handles
    pdf.setLineWidth(size/5);
    pdf.setDrawColor(200, 170, 0);
    pdf.line(x - size*0.8, y - size*2, x - size*1.5, y - size*1.8);
    pdf.line(x + size*0.8, y - size*2, x + size*1.5, y - size*1.8);
  };
  
  // Draw trophies next to title
  drawTrophy(PDF_CONFIG.pageWidth / 2 - 25, titleY);
  drawTrophy(PDF_CONFIG.pageWidth / 2 + 25, titleY);
  
  yPosition = titleY + PDF_CONFIG.lineHeight * 1.5;
  
  // Add each winner with balanced styling
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
      pdf.setFillColor(240, 250, 245);
      pdf.roundedRect(
        PDF_CONFIG.margin + 5, 
        yPosition - 2, 
        PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2) - 10, 
        PDF_CONFIG.lineHeight * 3, 
        2, 
        2, 
        'F'
      );
      
      // Add winner name
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(PDF_CONFIG.fontSizes.normal);
      pdf.setTextColor(0, 100, 0); // Dark Green
      pdf.text(`${winnerCount}. ${playerData.name}`, PDF_CONFIG.margin + 10, yPosition + 3);
      
      yPosition += PDF_CONFIG.lineHeight * 1.2;
      
      // Find winning combinations
      const winningCombos = playerData.combinations.filter(c => c.hits === 6);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(PDF_CONFIG.fontSizes.small);
      pdf.setTextColor(0, 0, 0);
      
      // Add each winning combination with circular number badges
      for (const combo of winningCombos) {
        if (!combo.numbers || !Array.isArray(combo.numbers)) {
          continue;
        }
        
        // Numbers with badge style
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        const startX = PDF_CONFIG.margin + 20;
        
        // Draw number badges
        for (let i = 0; i < sortedNumbers.length; i++) {
          const num = sortedNumbers[i];
          const numString = String(num).padStart(2, '0');
          const x = startX + (i * 15); // Reduced spacing
          
          // Draw badge background
          pdf.setFillColor(0, 158, 26); // Green
          pdf.circle(x + 5, yPosition - 1, 5, 'F'); // Smaller circle
          
          // Draw number on badge
          pdf.setTextColor(255, 255, 255); // White
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(PDF_CONFIG.fontSizes.small); // Smaller font size
          pdf.text(numString, x + 5 - (numString.length * 1.5), yPosition + 1);
        }
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
        
        yPosition += PDF_CONFIG.lineHeight;
      }
      
      yPosition += PDF_CONFIG.lineHeight / 2;
    } catch (error) {
      console.error("Error processing winner:", error);
      continue;
    }
  }
  
  return yPosition + 5; // Add minimal padding at the end
};
