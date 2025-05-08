
import jsPDF from 'jspdf';
import { Game } from '@/contexts/game/types';
import { createPDF, PDF_CONFIG, addHeader } from './builders/base-pdf';
import { addNearWinnersSection } from './builders/near-winners';

/**
 * Safely get drawn numbers from a game
 * @param game The game data
 * @returns An array of drawn numbers
 */
const safeGetDrawnNumbers = (game: Game): number[] => {
  if (!game || !game.dailyDraws) return [];
  
  const numbers: number[] = [];
  
  try {
    for (const draw of game.dailyDraws) {
      if (draw && Array.isArray(draw.numbers)) {
        numbers.push(...draw.numbers);
      }
    }
  } catch (error) {
    console.error("Error processing drawn numbers:", error);
  }
  
  return numbers;
};

/**
 * Add player information to the PDF
 * @param pdf The PDF document
 * @param game The game data
 * @param yPosition The current Y position
 * @returns The new Y position
 */
const addPlayers = (
  pdf: jsPDF, 
  game: Game,
  yPosition: number
): number => {
  if (!game.players || !Array.isArray(game.players) || game.players.length === 0) {
    return yPosition;
  }
  
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
  const drawnNumbers = safeGetDrawnNumbers(game);
  const drawnNumbersSet = new Set(drawnNumbers);
  
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
      
      // Add ALL combinations (remove limit of 3 per player)
      if (Array.isArray(player.combinations)) {
        // Sort by hits (highest first)
        const sortedCombos = [...player.combinations]
          .filter(c => c && typeof c === 'object')
          .sort((a, b) => (b.hits || 0) - (a.hits || 0));
        
        // Show all combinations - removed limit
        for (const combo of sortedCombos) {
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
              pdf.setTextColor(0, 158, 26); // Green
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

/**
 * Add game winners to the PDF
 * @param pdf The PDF document
 * @param game The game data
 * @param yPosition The current Y position
 * @returns The new Y position
 */
const addWinners = (
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

/**
 * Generate a complete game report PDF
 * @param game The game data
 * @param options Options for PDF generation
 * @returns Promise that resolves when the PDF is saved
 */
export const generateSimplePdf = async (
  game: Game,
  options = {
    themeColor: "#39FF14",
    filename: "resultado.pdf",
    includeNearWinners: true
  }
): Promise<void> => {
  try {
    // Input validation
    if (!game) {
      throw new Error("Dados do jogo não fornecidos");
    }
    
    if (!game.players || !Array.isArray(game.players)) {
      throw new Error("Lista de jogadores inválida");
    }
    
    if (!game.dailyDraws || !Array.isArray(game.dailyDraws)) {
      throw new Error("Lista de sorteios inválida");
    }
    
    console.log(`Gerando PDF para ${game.name || 'jogo sem nome'}`);
    
    // Create PDF document
    const pdf = createPDF();
    
    // Add header section using the standardized builder
    let yPosition = addHeader(pdf, game.name, game.startDate, { color: options.themeColor });
    
    // Get all drawn numbers from the game
    const allDrawnNumbers = safeGetDrawnNumbers(game);
    
    // Add near winners section (jogos amarrados) - only if no winners and if requested
    const hasWinners = Array.isArray(game.winners) && game.winners.length > 0;
    if (options.includeNearWinners && !hasWinners) {
      yPosition = addNearWinnersSection(pdf, game, allDrawnNumbers, { color: options.themeColor });
    }
    
    // Add winners section
    yPosition = addWinners(pdf, game, yPosition);
    
    // Add players section
    yPosition = addPlayers(pdf, game, yPosition);
    
    // Sanitize filename
    const safeFilename = options.filename
      ? options.filename.replace(/[^\w.-]/g, "-")
      : `resultado-${(game.name || 'jogo').replace(/[^\w.-]/g, "-")}.pdf`;
    
    // Save PDF
    pdf.save(safeFilename);
    
    return Promise.resolve();
  } catch (error) {
    console.error("Erro na geração do PDF:", error);
    return Promise.reject(error instanceof Error ? error : new Error("Erro desconhecido na geração do PDF"));
  }
};
