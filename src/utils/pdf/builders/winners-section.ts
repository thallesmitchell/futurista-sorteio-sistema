
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
  const sectionStartY = yPosition + 15;
  
  // Winners title with clean design
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(0, 130, 20); // Green
  
  // Add title
  pdf.text("GANHADORES", PDF_CONFIG.pageWidth / 2, sectionStartY, { align: "center" });
  
  let currentY = sectionStartY + PDF_CONFIG.lineHeight * 2;
  
  // Draw SVG trophies next to title
  const drawTrophy = (x: number, y: number, scale: number = 1) => {
    // Trophy base
    const baseSize = 7 * scale;
    
    // Save the current state
    pdf.saveGraphicsState();
    
    // Set colors
    pdf.setFillColor(212, 175, 55); // Gold color
    pdf.setDrawColor(139, 69, 19);  // Dark bronze for outlines
    pdf.setLineWidth(0.2);
    
    // Trophy cup
    pdf.ellipse(x, y - baseSize/2, baseSize/2, baseSize/3, 'F');
    
    // Trophy stem
    pdf.rect(x - baseSize/8, y - baseSize/2, baseSize/4, baseSize/1.5, 'F');
    
    // Trophy base
    pdf.rect(x - baseSize/2, y + baseSize/3, baseSize, baseSize/4, 'F');
    
    // Trophy handles (curved lines)
    pdf.setLineWidth(baseSize/10);
    pdf.setDrawColor(212, 175, 55);
    
    // Left handle
    pdf.line(x - baseSize/2, y - baseSize/2, x - baseSize/1.2, y - baseSize/4);
    
    // Right handle
    pdf.line(x + baseSize/2, y - baseSize/2, x + baseSize/1.2, y - baseSize/4);
    
    // Restore the previous state
    pdf.restoreGraphicsState();
  };
  
  // Draw trophies on both sides of the title
  drawTrophy(PDF_CONFIG.pageWidth / 2 - 25, sectionStartY, 1.2);
  drawTrophy(PDF_CONFIG.pageWidth / 2 + 25, sectionStartY, 1.2);
  
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
      currentY += 12;
      
      // Add winner name centered with better styling
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(PDF_CONFIG.fontSizes.normal + 1);
      pdf.setTextColor(0, 100, 0); // Dark Green
      pdf.text(`${winnerCount}. ${playerData.name}`, PDF_CONFIG.pageWidth / 2, currentY, { align: "center" });
      
      // More space after winner name
      currentY += PDF_CONFIG.lineHeight * 2; 
      
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
        const badgeWidth = 14; // Increased width per badge in mm
        const totalWidth = numberCount * badgeWidth;
        let startX = (PDF_CONFIG.pageWidth - totalWidth) / 2;
        
        // Draw larger number badges in a centered row
        for (let i = 0; i < sortedNumbers.length; i++) {
          const num = sortedNumbers[i];
          const numString = String(num).padStart(2, '0');
          const x = startX + (i * badgeWidth);
          
          // Draw larger badge background
          pdf.setFillColor(0, 158, 26); // Green
          pdf.circle(x + 7, currentY, 7, 'F'); // Larger circle (7mm radius)
          
          // Draw number on badge with larger text
          pdf.setTextColor(255, 255, 255); // White
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(PDF_CONFIG.fontSizes.normal + 2); // Larger text
          
          // Center text in circle
          const textWidth = pdf.getStringUnitWidth(numString) * pdf.getFontSize() / pdf.internal.scaleFactor;
          pdf.text(numString, x + 7 - (textWidth/2), currentY + 1.8);
        }
        
        // Add more space after the combo
        currentY += PDF_CONFIG.lineHeight * 3;
      }
      
      // Add more space between winners
      currentY += 10;
      
      // Add separator line between winners (except after the last one)
      if (winnerCount < game.winners.length) {
        pdf.setDrawColor(0, 130, 20, 0.3); // Light green
        pdf.setLineWidth(0.5);
        pdf.line(
          PDF_CONFIG.pageWidth / 4, 
          currentY - 5, 
          PDF_CONFIG.pageWidth * 3/4, 
          currentY - 5
        );
      }
    } catch (error) {
      console.error("Error processing winner:", error);
      continue;
    }
  }
  
  // Ensure adequate spacing after the winners section
  currentY += 15;
  
  // Add a more visible separator at the end of the section
  pdf.setDrawColor(0, 130, 20);
  pdf.setLineWidth(0.8);
  pdf.line(
    PDF_CONFIG.margin, 
    currentY, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
    currentY
  );
  
  return currentY + 15; // Return with extra padding for next section
};
