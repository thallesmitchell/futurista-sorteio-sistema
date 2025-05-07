
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG, drawBall } from './base-pdf';

// Add "Jogos Amarrados" section (near winners with 5 hits)
export const addNearWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  options = { color: '#39FF14' }
): number => {
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Find players with combinations that have exactly 5 hits
  const nearWinners = game.players
    .filter(player => player.combinations.some(combo => combo.hits === 5))
    .map(player => {
      const nearWinningCombos = player.combinations.filter(combo => combo.hits === 5);
      return { player, combos: nearWinningCombos };
    })
    .filter(item => item.combos.length > 0);
    
  // If no near winners, return current position
  if (nearWinners.length === 0) {
    return PDF_CONFIG.margin + 30; // Return position after header
  }
  
  // Section title
  let currentY = PDF_CONFIG.margin + 35;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Jogos Amarrados', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 8;
  
  // Description
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.textFontSize);
  pdf.setTextColor('#000000');
  pdf.text(
    'Jogadores com 5 acertos (falta apenas 1 número para ganhar)',
    PDF_CONFIG.pageWidth / 2, 
    currentY,
    { align: 'center' }
  );
  
  currentY += 15; // Space between title and boxes
  
  // Boxes for each near winner - each taking 100% width
  const boxWidth = PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2);
  
  nearWinners.forEach((item, index) => {
    // Draw player box
    pdf.setDrawColor(options.color);
    pdf.setFillColor('#f8f8f8');
    pdf.roundedRect(PDF_CONFIG.margin, currentY, boxWidth, 50, 3, 3, 'FD'); // Adjusted height
    
    // Player name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.headerFontSize);
    pdf.setTextColor('#000000');
    pdf.text(item.player.name, PDF_CONFIG.pageWidth / 2, currentY + 10, { align: 'center' });
    
    // For each combination with 5 hits
    let comboY = currentY + 25; // Adjusted vertical position
    
    item.combos.forEach((combo, comboIndex) => {
      if (comboIndex > 0) {
        comboY += 15; // Spacing between combinations
      }
      
      // Limited to first few combinations due to space constraints
      if (comboIndex < 3) {
        // Numbers
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        
        // Calculate starting position to center numbers
        const ballSize = PDF_CONFIG.ballSize + 5; // 10px larger as requested
        const spacing = 20; // 20px distance between circles
        const totalWidth = sortedNumbers.length * spacing; 
        let numberX = (PDF_CONFIG.pageWidth - totalWidth) / 2 + ballSize / 2;
        
        sortedNumbers.forEach((number, i) => {
          const isHit = drawnNumbersSet.has(number);
          drawBall(pdf, 
            numberX + (i * spacing), 
            comboY, 
            number, 
            {
              size: ballSize, // Larger balls as requested
              colorFill: options.color,
              colorBorder: options.color,
              colorText: '#FFFFFF',
              isHit
            }
          );
        });
      } else if (comboIndex === 3) {
        // Indicate there are more combinations
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(PDF_CONFIG.smallTextFontSize);
        pdf.text(`+ ${item.combos.length - 3} mais sequências com 5 acertos`, PDF_CONFIG.pageWidth / 2, comboY, { align: 'center' });
      }
    });
    
    // Update Y position for next player
    currentY += 60; // Box height + spacing
  });
  
  // Return final Y position after near winners section
  return currentY + 10;
}
