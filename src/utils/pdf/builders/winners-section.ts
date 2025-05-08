
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';

/**
 * Add game winners to the PDF
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
    return yPosition;
  }
  
  // Winners title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(0, 158, 26); // Green
  pdf.text("GANHADORES", PDF_CONFIG.pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += PDF_CONFIG.lineHeight * 1.5;
  
  // Add each winner
  for (const winner of game.winners) {
    try {
      const playerData = game.players.find(p => p.id === winner.id);
      if (!playerData) continue;
      
      // Add winner name
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(playerData.name, PDF_CONFIG.margin, yPosition);
      
      yPosition += PDF_CONFIG.lineHeight;
      
      // Find winning combinations
      const winningCombos = playerData.combinations.filter(c => c.hits === 6);
      
      pdf.setFont("helvetica", "normal");
      
      // Add each combination
      for (const combo of winningCombos) {
        if (!combo.numbers || !Array.isArray(combo.numbers)) continue;
        
        const numbersText = combo.numbers
          .filter(n => typeof n === 'number')
          .sort((a, b) => a - b)
          .map(n => String(n).padStart(2, '0'))
          .join(' - ');
          
        pdf.text(`Números: ${numbersText}`, PDF_CONFIG.margin + 5, yPosition);
        
        yPosition += PDF_CONFIG.lineHeight;
      }
      
      yPosition += 5;
    } catch (error) {
      console.error("Error processing winner:", error);
      continue;
    }
  }
  
  return yPosition + 10;
};
