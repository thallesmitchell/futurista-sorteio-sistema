
import { jsPDF } from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';

/**
 * Trophy SVG data as a string for embedding
 */
const TROPHY_SVG = `<svg id="Layer_1" height="512" viewBox="0 0 128 128" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="m59.883 80.283h8.234v14.217h-8.234z" fill="#fbbe2c"/><path d="m57.461 62h13.078v18.283h-13.078z" fill="#fd9e27"/><path d="m36.428 10h55.144a0 0 0 0 1 0 0v35.2a27.572 27.572 0 0 1 -27.572 27.571 27.572 27.572 0 0 1 -27.572-27.571v-35.2a0 0 0 0 1 0 0z" fill="#fbbe2c"/><path d="m47.178 107.25h33.644a10.75 10.75 0 0 1 10.75 10.75 0 0 0 0 1 0 0h-55.144a0 0 0 0 1 0 0 10.75 10.75 0 0 1 10.75-10.75z" fill="#fbbe2c"/><path d="m47.172 94.5h33.656v12.75h-33.656z" fill="#deecf1"/><path d="m57.46 67.106a1.75 1.75 0 0 1 -.638-.121c-13.151-5.153-14.545-15.156-14.6-15.579a1.75 1.75 0 0 1 3.472-.443c.051.366 1.3 8.411 12.4 12.763a1.75 1.75 0 0 1 -.639 3.38z" fill="#fdd880"/><path d="m64 20.296 4.887 9.901 10.926 1.588-7.906 7.707 1.866 10.883-9.773-5.138-9.773 5.138 1.866-10.883-7.906-7.707 10.926-1.588z" fill="#deecf1"/><path d="m36.584 48.167a28.442 28.442 0 0 1 -10.517-24.984h10.355v-5.62h-12.802a2.81 2.81 0 0 0 -2.748 2.224 35.5 35.5 0 0 0 4.934 24.838 35.363 35.363 0 0 0 12.985 11.753 27.379 27.379 0 0 1 -2.207-8.211z" fill="#fbbe2c"/><g fill="#fd9e27"><path d="m91.416 48.167a28.442 28.442 0 0 0 10.516-24.984h-10.354v-5.62h12.8a2.81 2.81 0 0 1 2.748 2.224 35.5 35.5 0 0 1 -4.934 24.838 35.363 35.363 0 0 1 -12.983 11.753 27.379 27.379 0 0 0 2.207-8.211z"/><path d="m64 72.771a27.572 27.572 0 0 0 27.572-27.571v-35.2h-27.572z"/><path d="m64 80.283h4.117v14.217h-4.117z"/></g><path d="m64 94.5h16.828v12.75h-16.828z" fill="#c7e2e7"/><path d="m64 107.25v10.75h27.572a10.75 10.75 0 0 0 -10.75-10.75z" fill="#fd9e27"/><path d="m73.773 50.375-1.866-10.883 7.906-7.707-10.926-1.588-4.887-9.901v24.941z" fill="#c7e2e7"/></svg>`;

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
  
  // Section start position
  const sectionStartY = yPosition + 10;
  
  // Create a background rectangle with dashed border for winners section
  pdf.setDrawColor(0, 130, 20); // Green border
  pdf.setFillColor(230, 255, 230); // Light green background
  pdf.setLineWidth(0.5);
  
  // Set dash pattern for the border
  pdf.setLineDashPattern([5, 5], 0);
  
  // Draw background rectangle covering the entire winners section
  // We'll calculate height based on content later
  const sectionWidth = PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2);
  let estimatedHeight = 25 + (game.winners.length * 60); // Initial estimate
  
  pdf.roundedRect(
    PDF_CONFIG.margin, 
    sectionStartY, 
    sectionWidth,
    estimatedHeight,
    3, 3, 
    'FD'
  );
  
  // Reset dash pattern for other elements
  pdf.setLineDashPattern([], 0);
  
  // Section title "GANHADORES" in center
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(0, 130, 20); // Green
  pdf.text("GANHADORES", PDF_CONFIG.pageWidth / 2, sectionStartY + 15, { align: "center" });
  
  let currentY = sectionStartY + 30; // Start position for winners
  
  // Process each winner
  for (let winnerIndex = 0; winnerIndex < game.winners.length; winnerIndex++) {
    const winner = game.winners[winnerIndex];
    const playerData = game.players.find(p => p.id === winner.id);
    
    if (!playerData) {
      console.log(`Winner player data not found for id: ${winner.id}`);
      continue;
    }
    
    console.log(`Adding winner ${winnerIndex + 1}: ${playerData.name}`);
    
    // Draw white rounded rectangle background for winner
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(255, 255, 255);
    
    const winnerCardWidth = sectionWidth - 20; // Narrower than section
    const winnerCardHeight = 50; // Estimate height
    
    pdf.roundedRect(
      PDF_CONFIG.pageWidth / 2 - winnerCardWidth / 2, 
      currentY, 
      winnerCardWidth,
      winnerCardHeight,
      3, 3, 
      'F'
    );
    
    // Add trophy icon - using a custom function to create a simplified trophy icon
    const addTrophyIcon = (x: number, y: number) => {
      // Define the gold color for trophy
      pdf.setFillColor(253, 184, 19); // Gold
      
      // Draw trophy cup main body
      pdf.roundedRect(x - 4, y - 4, 8, 8, 1, 1, 'F');
      
      // Draw trophy stem
      pdf.setFillColor(253, 184, 19);
      pdf.rect(x - 1.5, y + 4, 3, 4, 'F');
      
      // Draw trophy base
      pdf.setFillColor(253, 184, 19);
      pdf.rect(x - 3, y + 8, 6, 1.5, 'F');
    };
    
    // Add winner number and name
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(PDF_CONFIG.fontSizes.normal + 1);
    pdf.setTextColor(0, 0, 0);
    
    // Draw trophy on the left side
    addTrophyIcon(PDF_CONFIG.pageWidth / 2 - winnerCardWidth / 2 + 15, currentY + 12);
    
    // Add winner name with index number
    pdf.text(
      `${winnerIndex + 1}. ${playerData.name}`, 
      PDF_CONFIG.pageWidth / 2 - winnerCardWidth / 2 + 30, 
      currentY + 15
    );
    
    // Find winning combinations
    const winningCombos = playerData.combinations.filter(c => c.hits === 6);
    
    if (winningCombos.length > 0) {
      // Add winner numbers with green circles centered in card
      const combo = winningCombos[0];
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Center the number badges
      const numberCount = sortedNumbers.length;
      const badgeWidth = 18; // Width per badge in mm
      const totalWidth = numberCount * badgeWidth;
      let startX = PDF_CONFIG.pageWidth / 2 - totalWidth / 2;
      
      // Draw each number in a green circle
      sortedNumbers.forEach((num, i) => {
        const numString = String(num).padStart(2, '0');
        const x = startX + (i * badgeWidth) + badgeWidth/2;
        
        // Draw green circle background
        pdf.setFillColor(0, 158, 26); // Green
        pdf.circle(x, currentY + 35, 8, 'F');
        
        // Draw number in white
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(PDF_CONFIG.fontSizes.normal + 2);
        
        // Center text in circle
        const textWidth = pdf.getStringUnitWidth(numString) * pdf.getFontSize() / pdf.internal.scaleFactor;
        pdf.text(numString, x - (textWidth/2), currentY + 37);
      });
    }
    
    // Move to next winner position with sufficient spacing
    currentY += winnerCardHeight + 10;
    
    // Add separator line between winners if not the last one
    if (winnerIndex < game.winners.length - 1) {
      pdf.setDrawColor(0, 130, 20, 0.3);
      pdf.setLineWidth(0.5);
      pdf.line(
        PDF_CONFIG.pageWidth / 2 - winnerCardWidth / 3,
        currentY - 5,
        PDF_CONFIG.pageWidth / 2 + winnerCardWidth / 3,
        currentY - 5
      );
    }
  }
  
  // Adjust the background rectangle to actual content height
  // We need to redraw it with correct height
  const actualHeight = currentY - sectionStartY + 10;
  
  // Clear previous background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(PDF_CONFIG.margin - 1, sectionStartY - 1, sectionWidth + 2, estimatedHeight + 2, 'F');
  
  // Redraw background with correct height
  pdf.setDrawColor(0, 130, 20);
  pdf.setFillColor(230, 255, 230);
  pdf.setLineWidth(0.5);
  pdf.setLineDashPattern([5, 5], 0);
  
  pdf.roundedRect(
    PDF_CONFIG.margin, 
    sectionStartY, 
    sectionWidth,
    actualHeight,
    3, 3, 
    'FD'
  );
  
  // Reset dash pattern
  pdf.setLineDashPattern([], 0);
  
  // Redraw title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(0, 130, 20);
  pdf.text("GANHADORES", PDF_CONFIG.pageWidth / 2, sectionStartY + 15, { align: "center" });
  
  // Add bottom margin
  return currentY + 15;
};
