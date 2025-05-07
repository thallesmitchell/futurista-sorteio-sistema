
import jsPDF from 'jspdf';
import { Game, Player } from '@/contexts/game/types';
import { PDF_CONFIG, drawBall } from './base-pdf';

// Type definition for player combination
type PlayerCombination = {
  numbers: number[];
  hits: number;
};

// Add winners section to PDF - updated as requested
export const addWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  startY: number,
  options = { color: '#39FF14' }
): number => {
  // If no winners, return current position
  if (!game.winners || game.winners.length === 0) {
    return startY;
  }
  
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Section title - using "SAIU GANHADOR!" format
  let currentY = startY;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor('#009e1a'); // Darker green for emphasis
  pdf.text('SAIU GANHADOR!', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 15; // Improved spacing
  
  // Winners block
  const winners = game.winners.map(winner => {
    const playerData = game.players.find(p => p.id === winner.id);
    if (!playerData) return null;
    
    const winningCombos = playerData.combinations.filter(c => c.hits === 6);
    return { player: playerData, winningCombos };
  }).filter(Boolean) as { player: Player, winningCombos: PlayerCombination[] }[];
  
  // Improved design for winners - based on visual reference
  winners.forEach((winner) => {
    // Winner box with improved design, more rounded and green
    pdf.setDrawColor('#009e1a');
    pdf.setFillColor('#e4f9e8'); // Light green background
    pdf.roundedRect(
      PDF_CONFIG.margin, 
      currentY, 
      PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2), 
      25 + (winner.winningCombos.length * 20), // Height adjusted to contain all elements
      10, // More rounded borders as shown in image
      10, 
      'FD'
    );
    
    // Adding trophy icons on sides (simulated with emoji)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(20);
    pdf.setTextColor('#009e1a');
    
    // Left trophy
    pdf.text('🏆', PDF_CONFIG.margin + 15, currentY + 12);
    
    // Centered player name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
    pdf.setTextColor('#009e1a');
    pdf.text(winner.player.name.toUpperCase(), PDF_CONFIG.pageWidth / 2, currentY + 12, { align: 'center' });
    
    // Right trophy
    const trophyWidth = pdf.getStringUnitWidth('🏆') * 20 / pdf.internal.scaleFactor;
    pdf.text('🏆', PDF_CONFIG.pageWidth - PDF_CONFIG.margin - 15 - trophyWidth, currentY + 12);
    
    // Winning combinations
    let comboY = currentY + 25;
    
    winner.winningCombos.forEach(combo => {
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Calculate starting position to center numbers
      const ballSize = PDF_CONFIG.ballSize + 3; // Larger size for emphasis
      const spacing = 20; // Spacing between balls
      const totalWidth = sortedNumbers.length * spacing; 
      let startX = (PDF_CONFIG.pageWidth - totalWidth) / 2 + ballSize / 2;
      
      // Draw each number
      sortedNumbers.forEach((number, i) => {
        drawBall(pdf, 
          startX + (i * spacing), // Spacing between balls
          comboY, 
          number, 
          {
            size: ballSize, // Larger size for emphasis
            colorFill: '#009e1a', // More vibrant green
            colorBorder: '#009e1a',
            colorText: '#FFFFFF',
            isHit: true
          }
        );
      });
      
      comboY += 20;
    });
    
    // Update Y position for next winner
    currentY = comboY + 15;
  });
  
  return currentY + 5;
}
