
import { jsPDF } from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';

/**
 * Add game winners to the PDF with an improved design following reference image
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
  
  console.log(`Adding ${game.winners.length} winners to PDF with improved design`);
  
  // Start with a good amount of space before the section
  const sectionStartY = yPosition + 5;
  
  // Winners title with clean design
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(0, 130, 20); // Green
  
  // Add title
  pdf.text("GANHADORES", PDF_CONFIG.pageWidth / 2, sectionStartY, { align: "center" });
  
  let currentY = sectionStartY + PDF_CONFIG.lineHeight * 1.5;
  
  // Draw SVG trophies next to title using path commands for better quality
  const drawTrophy = (centerX: number, centerY: number, size: number = 4) => {
    // Trophy cup - simplified SVG-like path
    pdf.setLineWidth(0.1);
    pdf.setDrawColor(180, 150, 0); // Gold outline
    pdf.setFillColor(220, 180, 0); // Gold fill
    
    // Trophy base
    const baseWidth = size * 1.5;
    const baseHeight = size * 0.8;
    pdf.roundedRect(
      centerX - baseWidth/2, 
      centerY + size*0.5, 
      baseWidth, 
      baseHeight, 
      1, 1, 'FD'
    );
    
    // Trophy cup
    pdf.ellipse(centerX, centerY - size*0.5, size, size*0.7, 'FD');
    
    // Trophy handles
    pdf.setLineWidth(size/10);
    pdf.setDrawColor(220, 180, 0);
    
    // Left handle
    pdf.line(
      centerX - size*0.8, 
      centerY - size*0.5, 
      centerX - size*1.5, 
      centerY
    );
    
    // Right handle
    pdf.line(
      centerX + size*0.8, 
      centerY - size*0.5, 
      centerX + size*1.5, 
      centerY
    );
    
    // Center line
    pdf.setLineWidth(size/15);
    pdf.line(
      centerX, 
      centerY + size*0.2, 
      centerX, 
      centerY + size*1.2
    );
  };
  
  // Draw trophies next to title
  drawTrophy(PDF_CONFIG.pageWidth / 2 - 30, sectionStartY - 1);
  drawTrophy(PDF_CONFIG.pageWidth / 2 + 30, sectionStartY - 1);
  
  // Add each winner with improved spacing and centralized content
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
      
      // Ensure adequate spacing before each winner
      currentY += 8;
      
      // Add winner name centered
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(PDF_CONFIG.fontSizes.normal);
      pdf.setTextColor(0, 100, 0); // Dark Green
      pdf.text(`${winnerCount}. ${playerData.name}`, PDF_CONFIG.pageWidth / 2, currentY, { align: "center" });
      
      currentY += PDF_CONFIG.lineHeight * 1.5; // Increased space after winner name
      
      // Find winning combinations
      const winningCombos = playerData.combinations.filter(c => c.hits === 6);
      
      // Process each winning combination
      for (const combo of winningCombos) {
        if (!combo.numbers || !Array.isArray(combo.numbers)) {
          continue;
        }
        
        // Sort numbers for consistent display
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        
        // Center the number badges
        const numberCount = sortedNumbers.length;
        const badgeWidth = 13; // Width per badge in mm
        const totalWidth = numberCount * badgeWidth;
        let startX = (PDF_CONFIG.pageWidth - totalWidth) / 2;
        
        // Draw larger number badges in a centered row
        for (let i = 0; i < sortedNumbers.length; i++) {
          const num = sortedNumbers[i];
          const numString = String(num).padStart(2, '0');
          const x = startX + (i * badgeWidth);
          
          // Draw larger badge background
          pdf.setFillColor(0, 158, 26); // Green
          pdf.circle(x + 6, currentY, 6, 'F'); // Larger circle (6mm radius)
          
          // Draw number on badge with larger text
          pdf.setTextColor(255, 255, 255); // White
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(PDF_CONFIG.fontSizes.normal); // Larger text
          
          // Center text in circle
          const textWidth = pdf.getStringUnitWidth(numString) * pdf.getFontSize() / pdf.internal.scaleFactor;
          pdf.text(numString, x + 6 - (textWidth/2), currentY + 1.5);
        }
        
        // Add space after the combo
        currentY += PDF_CONFIG.lineHeight * 2.5;
      }
      
      // Add more space between winners
      currentY += 5;
      
      // Add separator line between winners (except after the last one)
      if (winnerCount < game.winners.length) {
        pdf.setDrawColor(0, 130, 20, 0.3); // Light green
        pdf.setLineWidth(0.5);
        pdf.line(
          PDF_CONFIG.pageWidth / 4, 
          currentY, 
          PDF_CONFIG.pageWidth * 3/4, 
          currentY
        );
        currentY += 5; // Space after separator
      }
    } catch (error) {
      console.error("Error processing winner:", error);
      continue;
    }
  }
  
  // Ensure adequate spacing after the winners section
  currentY += 10;
  
  // Add a more visible separator at the end of the section
  pdf.setDrawColor(0, 130, 20);
  pdf.setLineWidth(0.8);
  pdf.line(
    PDF_CONFIG.margin, 
    currentY, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
    currentY
  );
  
  return currentY + 10; // Return with extra padding for next section
};
