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
  const sectionStartY = yPosition + 7;
  
  // Winners title with clean design
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(0, 130, 20); // Green
  
  // Add title
  pdf.text("GANHADORES", PDF_CONFIG.pageWidth / 2, sectionStartY, { align: "center" });
  
  let currentY = sectionStartY + PDF_CONFIG.lineHeight * 2;
  
  // Add SVG trophies from external URL
  const trophyURL = "https://upload.wikimedia.org/wikipedia/commons/2/20/Trof%C3%A9u_de_NFA.svg";
  
  // Function to add trophy SVG on both sides of the title
  const addTrophyImage = (x: number, y: number, width: number, height: number) => {
    try {
      pdf.addSvgAsImage(trophyURL, x - width/2, y - height/2, width, height);
    } catch (error) {
      console.error("Error adding trophy SVG:", error);
      // Fallback to a simple rectangle if SVG fails
      pdf.setFillColor(212, 175, 55); // Gold color
      pdf.rect(x - width/2, y - height/2, width, height, 'F');
    }
  };
  
  // Add trophies on both sides of the title
  const trophySize = 15; // Size in mm
  addTrophyImage(PDF_CONFIG.pageWidth / 2 - 30, sectionStartY, trophySize, trophySize);
  addTrophyImage(PDF_CONFIG.pageWidth / 2 + 30, sectionStartY, trophySize, trophySize);
  
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
      currentY += 7;
      
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
      currentY += 8;
      
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