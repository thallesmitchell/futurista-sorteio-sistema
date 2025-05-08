
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import { PdfSectionOptions } from '../types';

/**
 * Add a section with all players and their combinations
 */
export const addPlayersSection = (
  pdf: jsPDF, 
  game: Game,
  allDrawnNumbers: number[],
  startY: number,
  options: PdfSectionOptions = { color: '#39FF14' }
): number => {
  if (!game.players || !Array.isArray(game.players) || game.players.length === 0) {
    return startY;
  }
  
  let yPosition = startY;
  
  // Players title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Jogadores", PDF_CONFIG.pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += PDF_CONFIG.lineHeight * 1.5;
  
  // Sort players alphabetically
  const sortedPlayers = [...game.players].sort((a, b) => 
    String(a.name).localeCompare(String(b.name))
  );
  
  // Drawn numbers for highlighting
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Add each player
  for (const player of sortedPlayers) {
    try {
      if (!player || typeof player !== 'object') continue;
      
      // Check if we need to add a new page
      if (yPosition > PDF_CONFIG.pageHeight - 30) {
        pdf.addPage();
        yPosition = PDF_CONFIG.margin;
      }
      
      // Calculate max hits
      let maxHits = 0;
      if (Array.isArray(player.combinations)) {
        for (const combo of player.combinations) {
          if (combo && typeof combo === 'object' && 'hits' in combo) {
            maxHits = Math.max(maxHits, combo.hits);
          }
        }
      }
      
      // Add player name - ensure consistent font size for all players
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(PDF_CONFIG.fontSizes.normal); // Set consistent font size
      pdf.text(`${player.name || 'Jogador sem nome'}`, PDF_CONFIG.margin, yPosition);
      
      // Add player stats
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(PDF_CONFIG.fontSizes.small);
      
      const comboCount = Array.isArray(player.combinations) ? player.combinations.length : 0;
      pdf.text(
        `${comboCount} sequência(s) - Max acertos: ${maxHits}`, 
        PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
        yPosition,
        { align: "right" }
      );
      
      yPosition += PDF_CONFIG.lineHeight;
      
      // Add combinations with respect to maxCombosPerPlayer option
      if (Array.isArray(player.combinations)) {
        // Sort by hits (highest first)
        const sortedCombos = [...player.combinations]
          .filter(c => c && typeof c === 'object')
          .sort((a, b) => (b.hits || 0) - (a.hits || 0));
        
        // Respect the max combinations setting if provided
        const maxCombos = options.maxCombosPerPlayer || sortedCombos.length;
        const combosToShow = sortedCombos.slice(0, maxCombos);
        
        for (const combo of combosToShow) {
          if (!combo || !Array.isArray(combo.numbers)) continue;
          
          // Check if we need to add a new page for this combination
          if (yPosition > PDF_CONFIG.pageHeight - 20) {
            pdf.addPage();
            yPosition = PDF_CONFIG.margin;
          }
          
          // Format the numbers
          const formattedNumbers = combo.numbers
            .filter(n => typeof n === 'number')
            .sort((a, b) => a - b)
            .map(n => {
              const isHit = drawnNumbersSet.has(n);
              const numStr = String(n).padStart(2, '0');
              return { num: numStr, isHit };
            });
          
          // Draw numbers with hits highlighted
          let xPos = PDF_CONFIG.margin + 10; // Adjusted starting position
          pdf.setFont("helvetica", "normal");
          
          for (let i = 0; i < formattedNumbers.length; i++) {
            const { num, isHit } = formattedNumbers[i];
            if (isHit) {
              // Draw highlighted number
              // pdf.setTextColor(0, 158, 26); // Green
              // pdf.setFont("helvetica", "bold");

               // Tamanho do círculo - Thalles
                const radius = 12;
                // Desenha o círculo verde
                pdf.setFillColor(0, 158, 26); // Verde
                pdf.circle(x, y, radius, 'F');
                
                // Configura o texto (número)
                pdf.setTextColor(255, 255, 255); // Branco
                pdf.setFont("helvetica", "bold");
              
            } else {
              // Draw regular number
              pdf.setTextColor(0, 0, 0); // Black
              pdf.setFont("helvetica", "normal");
            }
            
            // Adjust spacing based on font size
            pdf.text(num, xPos, yPosition);
            xPos += 10; // Adjusted spacing for smaller font
          }
          
          // Reset text color
          pdf.setTextColor(0, 0, 0);
          yPosition += PDF_CONFIG.lineHeight;
        }
        
        // If there are more combinations than shown
        if (sortedCombos.length > maxCombos) {
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(PDF_CONFIG.fontSizes.small - 1);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            `+ ${sortedCombos.length - maxCombos} mais sequência${sortedCombos.length - maxCombos !== 1 ? 's' : ''}`,
            PDF_CONFIG.margin + 10,
            yPosition
          );
          yPosition += PDF_CONFIG.lineHeight;
        }
      }
      
      // Add a separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(
        PDF_CONFIG.margin, 
        yPosition, 
        PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
        yPosition
      );
      
      yPosition += 7; // Spacing between players
    } catch (error) {
      console.error("Error processing player:", error);
      continue;
    }
  }
  
  return yPosition;
};
