
import html2pdf from 'html2pdf.js';
import { Game } from '@/contexts/game/types';
import { GeneratePdfOptions } from './types';
import { createReportContainer, addHeaderToReport } from './components/container';
import { addWinnersBanner } from './components/winners-banner';
import { addPlayersToReport } from './components/players-list';

/**
 * Generates a PDF report for a game
 * @param game The game data to generate a report for
 * @param options Options for the PDF generation
 * @returns A promise that resolves when the PDF is generated
 */
export const generateGameReport = async (game: Game, options: GeneratePdfOptions = {}): Promise<void> => {
  console.log('Generating PDF report for game:', game.name);
  console.log('Game data:', {
    players: game.players.length,
    dailyDraws: game.dailyDraws.length,
    winners: game.winners?.length || 0,
  });
  
  try {
    // Get current date for the report
    const currentDate = new Date();
    const reportTitle = "Resultado";
    
    // Format date as in the example (06/maio/2025)
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", 
                    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const formattedDateForDisplay = `${day}/${month}/${year}`;
    
    // Get all drawn numbers
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
    console.log('All drawn numbers:', allDrawnNumbers);
    
    // Extract winners if any
    const winners = game.winners || [];
    const winnerIds = winners.map(w => w.id);
    console.log('Winners:', winners.length);
    
    // Create report container with the required styling
    const reportElement = document.createElement('div');
    reportElement.className = 'pdf-content';
    reportElement.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    reportElement.style.padding = '20px';
    reportElement.style.margin = '0';
    reportElement.style.backgroundColor = '#020817';
    reportElement.style.color = '#FFFFFF';
    reportElement.style.maxWidth = '100%';
    reportElement.style.minHeight = '100vh';
    reportElement.style.boxSizing = 'border-box';
    reportElement.style.overflow = 'hidden';
    
    // Add header
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '30px';
    header.style.padding = '10px';
    header.style.display = 'block';
    header.style.backgroundColor = '#0D1526';
    header.style.borderRadius = '8px';
    header.style.border = '1px solid #172842';
    
    const titleElement = document.createElement('div');
    titleElement.style.fontSize = '24px';
    titleElement.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    titleElement.style.margin = '10px 0';
    titleElement.innerHTML = `${reportTitle}<br/>${formattedDateForDisplay}`;
    
    header.appendChild(titleElement);
    reportElement.appendChild(header);
    
    // Add winners banner at the top, before the player list
    if (winners.length > 0) {
      console.log('Adding winners banner to PDF');
      
      // Create banner container
      const bannerContainer = document.createElement('div');
      bannerContainer.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
      bannerContainer.style.borderRadius = '8px';
      bannerContainer.style.border = '2px solid #25C17E';
      bannerContainer.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.5)';
      bannerContainer.style.overflow = 'hidden';
      bannerContainer.style.marginBottom = '20px';
      bannerContainer.style.pageBreakInside = 'avoid';
      bannerContainer.style.breakInside = 'avoid';
      
      const bannerContent = document.createElement('div');
      bannerContent.style.padding = '12px 16px';
      bannerContent.style.display = 'flex';
      bannerContent.style.flexDirection = 'column';
      bannerContent.style.gap = '12px';
      
      // Banner header with trophy
      const bannerHeader = document.createElement('div');
      bannerHeader.style.display = 'flex';
      bannerHeader.style.alignItems = 'center';
      bannerHeader.style.justifyContent = 'center';
      bannerHeader.style.gap = '8px';
      bannerHeader.style.textAlign = 'center';
      
      // Trophy icon
      const trophyLeft = document.createElement('div');
      trophyLeft.innerHTML = '🏆';
      trophyLeft.style.color = '#25C17E';
      trophyLeft.style.fontSize = '24px';
    
      const bannerTitle = document.createElement('h2');
      bannerTitle.textContent = 'Saiu Ganhador!';
      bannerTitle.style.fontSize = '24px';
      bannerTitle.style.fontWeight = 'bold';
      bannerTitle.style.color = '#25C17E';
      bannerTitle.style.margin = '0';
      
      const trophyRight = document.createElement('div');
      trophyRight.innerHTML = '🏆';
      trophyRight.style.color = '#25C17E';
      trophyRight.style.fontSize = '24px';
      
      bannerHeader.appendChild(trophyLeft);
      bannerHeader.appendChild(bannerTitle);
      bannerHeader.appendChild(trophyRight);
      bannerContent.appendChild(bannerHeader);
      
      // Get winning combinations (6 hits)
      const winningEntries = winners.flatMap(winner => 
        winner.combinations
          .filter(combo => combo.hits === 6)
          .map(combo => ({ 
            playerName: winner.name, 
            numbers: combo.numbers 
          }))
      );
      
      if (winningEntries.length > 0) {
        // Winners grid
        const winnersGrid = document.createElement('div');
        winnersGrid.style.display = 'grid';
        winnersGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
        winnersGrid.style.gap = '12px';
        
        winningEntries.forEach((entry, index) => {
          const entryBox = document.createElement('div');
          entryBox.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
          entryBox.style.padding = '12px';
          entryBox.style.borderRadius = '8px';
          entryBox.style.border = '1px solid rgba(34, 197, 94, 0.5)';
          
          // Player name - made more prominent
          const playerName = document.createElement('p');
          playerName.textContent = entry.playerName;
          playerName.style.fontWeight = '700';
          playerName.style.fontSize = '20px';
          playerName.style.marginBottom = '10px';
          playerName.style.color = '#22c55e';
          playerName.style.textAlign = 'center';
          
          const numbersContainer = document.createElement('div');
          numbersContainer.style.display = 'flex';
          numbersContainer.style.flexWrap = 'wrap';
          numbersContainer.style.gap = '6px';
          numbersContainer.style.justifyContent = 'center';
          
          entry.numbers.sort((a, b) => a - b).forEach(number => {
            const ball = document.createElement('div');
            ball.style.width = '36px';
            ball.style.height = '36px';
            ball.style.borderRadius = '50%';
            ball.style.display = 'flex';
            ball.style.justifyContent = 'center';
            ball.style.alignItems = 'center';
            ball.style.fontWeight = 'bold';
            ball.style.fontSize = '14px';
            ball.style.position = 'relative';
            ball.style.lineHeight = '1';
            ball.style.backgroundColor = options.themeColor || '#25C17E';
            ball.style.color = 'white';
            ball.style.border = `2px solid ${options.themeColor || '#25C17E'}`;
            
            // Create inner span for proper vertical centering
            const innerSpan = document.createElement('span');
            innerSpan.textContent = String(number).padStart(2, '0');
            innerSpan.style.display = 'inline-block';
            innerSpan.style.lineHeight = '1';
            innerSpan.style.textAlign = 'center';
            innerSpan.style.position = 'absolute';
            innerSpan.style.top = '50%';
            innerSpan.style.left = '50%';
            innerSpan.style.transform = 'translate(-50%, -50%)';
            innerSpan.style.fontSize = '14px';
            
            ball.appendChild(innerSpan);
            numbersContainer.appendChild(ball);
          });
          
          entryBox.appendChild(playerName);
          entryBox.appendChild(numbersContainer);
          winnersGrid.appendChild(entryBox);
        });
        
        bannerContent.appendChild(winnersGrid);
        bannerContainer.appendChild(bannerContent);
        reportElement.appendChild(bannerContainer);
      }
    }
    
    // Add players in masonry layout
    console.log('Adding players to PDF, total players:', game.players.length);
    
    // Sort all players (including winners) by name
    const sortedPlayers = [...game.players].sort((a, b) => a.name.localeCompare(b.name));
    
    // Convert allDrawnNumbers to a Set for faster lookups
    const drawnNumbersSet = new Set(allDrawnNumbers);
    
    // Container for masonry layout
    const playersContainer = document.createElement('div');
    playersContainer.style.columnCount = '3';
    playersContainer.style.columnGap = '10px';
    playersContainer.style.backgroundColor = '#020817';
    
    sortedPlayers.forEach(player => {
      const playerBox = document.createElement('div');
      playerBox.style.backgroundColor = '#0D1526';
      playerBox.style.borderRadius = '8px';
      playerBox.style.marginBottom = '12px';
      playerBox.style.overflow = 'hidden';
      playerBox.style.pageBreakInside = 'avoid';
      playerBox.style.breakInside = 'avoid'; 
      playerBox.style.display = 'inline-block';
      playerBox.style.width = '100%';
      playerBox.style.border = '1px solid #172842';
      
      // Player box header with name - highlighted to be more visible
      const playerHeader = document.createElement('div');
      playerHeader.style.backgroundColor = '#172842';
      playerHeader.style.padding = '8px 10px';
      playerHeader.style.borderBottom = '1px solid #172842';
      
      // Create a player name header that stands out more
      const playerName = document.createElement('h3');
      playerName.textContent = player.name;
      playerName.style.fontSize = '16px';
      playerName.style.fontWeight = '800';
      playerName.style.margin = '0';
      playerName.style.color = '#FFFFFF';
      playerName.style.textAlign = 'center';
      
      playerHeader.appendChild(playerName);
      playerBox.appendChild(playerHeader);
      
      // Player info section
      const playerContent = document.createElement('div');
      playerContent.style.padding = '8px';
      
      // Player info with combinations count
      const playerInfoSection = document.createElement('div');
      playerInfoSection.style.display = 'flex';
      playerInfoSection.style.flexDirection = 'column';
      playerInfoSection.style.marginBottom = '8px';
      playerInfoSection.style.textAlign = 'center';
      
      const maxHits = Math.max(...player.combinations.map(c => c.hits), 0);
      const playerInfo = document.createElement('p');
      playerInfo.textContent = `${player.combinations.length} sequência${player.combinations.length !== 1 ? 's' : ''} | Acertos máximos: ${maxHits}`;
      playerInfo.style.fontSize = '12px';
      playerInfo.style.color = '#5C719B';
      playerInfo.style.margin = '0';
      playerInfo.style.fontWeight = '600';
      
      playerInfoSection.appendChild(playerInfo);
      playerContent.appendChild(playerInfoSection);
      
      // Combinations section
      const combinationsContainer = document.createElement('div');
      combinationsContainer.style.display = 'flex';
      combinationsContainer.style.flexDirection = 'column';
      combinationsContainer.style.gap = '6px';
      
      if (player.combinations && player.combinations.length > 0) {
        player.combinations.forEach((combo, comboIndex) => {
          const comboContainer = document.createElement('div');
          comboContainer.style.display = 'flex';
          comboContainer.style.flexDirection = 'column';
          comboContainer.style.gap = '4px';
          comboContainer.style.padding = '6px';
          comboContainer.style.backgroundColor = '#0D1526';
          comboContainer.style.borderRadius = '6px';
          comboContainer.style.border = '1px solid #172842';
          comboContainer.style.marginBottom = '6px';
          
          // Add sequence number label
          const sequenceLabel = document.createElement('div');
          sequenceLabel.textContent = `Sequência ${comboIndex + 1}`;
          sequenceLabel.style.fontSize = '11px';
          sequenceLabel.style.color = '#8899AA';
          sequenceLabel.style.fontWeight = '600';
          sequenceLabel.style.marginBottom = '2px';
          sequenceLabel.style.textAlign = 'center';
          comboContainer.appendChild(sequenceLabel);
          
          // Numbers row
          const comboRow = document.createElement('div');
          comboRow.style.display = 'flex';
          comboRow.style.flexWrap = 'wrap';
          comboRow.style.gap = '4px';
          comboRow.style.justifyContent = 'center';
          
          // Sort numbers for consistency
          const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
          
          // Create balls for each number
          sortedNumbers.forEach(number => {
            const isNumberHit = drawnNumbersSet.has(number);
            
            const ball = document.createElement('div');
            ball.style.width = '28px';
            ball.style.height = '28px';
            ball.style.borderRadius = '50%';
            ball.style.display = 'flex';
            ball.style.justifyContent = 'center';
            ball.style.alignItems = 'center';
            ball.style.fontWeight = 'bold';
            ball.style.fontSize = '14px';
            ball.style.position = 'relative';
            ball.style.lineHeight = '1';
            
            // Format number with leading zero
            const formattedNumber = String(number).padStart(2, '0');
            
            // Number styling based on hit status
            if (isNumberHit) {
              ball.style.backgroundColor = options.themeColor || '#25C17E';
              ball.style.color = 'white';
              ball.style.border = `2px solid ${options.themeColor || '#25C17E'}`;
            } else {
              ball.style.backgroundColor = '#1A1F2C';
              ball.style.color = '#FFFFFF';
              ball.style.border = `1px solid ${options.themeColor || '#25C17E'}`;
            }
            
            // Create inner span for proper vertical centering
            const innerSpan = document.createElement('span');
            innerSpan.textContent = formattedNumber;
            innerSpan.style.display = 'inline-block';
            innerSpan.style.lineHeight = '1';
            innerSpan.style.textAlign = 'center';
            innerSpan.style.position = 'absolute';
            innerSpan.style.top = '50%';
            innerSpan.style.left = '50%';
            innerSpan.style.transform = 'translate(-50%, -50%)';
            innerSpan.style.fontSize = '14px';
            
            ball.appendChild(innerSpan);
            comboRow.appendChild(ball);
          });
          
          comboContainer.appendChild(comboRow);
          combinationsContainer.appendChild(comboContainer);
        });
      }
      
      playerContent.appendChild(combinationsContainer);
      playerBox.appendChild(playerContent);
      playersContainer.appendChild(playerBox);
    });
    
    reportElement.appendChild(playersContainer);
    
    console.log('Report element HTML length:', reportElement.innerHTML.length);
    
    // Append report to the document for debugging (will be removed before generating PDF)
    document.body.appendChild(reportElement);
    
    // Generate PDF with specific options
    const pdfOptions = {
      margin: 0, // Remove margins completely
      filename: options.filename || `resultado-${game.name.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.85 }, // Reduced quality for better compression
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#020817'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        background: '#020817'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    console.log('Starting PDF generation with options:', pdfOptions);
    
    try {
      // Generate PDF
      await html2pdf().from(reportElement).set(pdfOptions).save();
      
      // Remove the element from DOM after generation
      document.body.removeChild(reportElement);
      
      console.log('PDF generated successfully');
    } catch (error) {
      // Remove the element from DOM on error
      if (document.body.contains(reportElement)) {
        document.body.removeChild(reportElement);
      }
      console.error('Error generating PDF:', error);
      throw error;
    }
  } catch (error) {
    console.error('Fatal error in PDF generation:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Re-export types
export * from './types';
