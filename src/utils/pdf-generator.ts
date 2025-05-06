
import html2pdf from 'html2pdf.js';
import { Game, Player } from '@/contexts/game/types';

interface GeneratePdfOptions {
  themeColor?: string;
}

/**
 * Generates a PDF report for a game
 * @param game The game data to generate a report for
 * @param options Options for the PDF generation
 * @returns A promise that resolves when the PDF is generated
 */
export const generateGameReport = async (game: Game, options: GeneratePdfOptions = {}): Promise<void> => {
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
  
  // Extract winners if any
  const winners = game.winners || [];
  const winnerIds = winners.map(w => w.id);
  
  // Create report container with the required styling
  const reportElement = createReportContainer();
  
  // Add header
  addHeaderToReport(reportElement, reportTitle, formattedDateForDisplay);
  
  // Add winners banner if there are winners
  if (winners.length > 0) {
    addWinnersBanner(reportElement, winners, allDrawnNumbers, options.themeColor || '#25C17E');
  }
  
  // Add players in masonry layout
  const regularPlayers = [...game.players]
    .filter(p => !winnerIds.includes(p.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  addPlayersToReport(reportElement, regularPlayers, allDrawnNumbers, options.themeColor || '#25C17E');
  
  // Generate PDF with specific options
  const pdfOptions = {
    margin: 0, // Remove margins completely
    filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${game.name.replace(/\s+/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.85 }, // Reduced quality for better compression
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true, // Enable compression
      background: '#0F111A' // Set background color for the PDF
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  
  return html2pdf().from(reportElement).set(pdfOptions).save();
};

/**
 * Creates the main container for the PDF report
 */
const createReportContainer = (): HTMLElement => {
  const reportElement = document.createElement('div');
  reportElement.className = 'pdf-content';
  reportElement.style.fontFamily = 'Montserrat, sans-serif'; // Using Montserrat font
  reportElement.style.padding = '20px';
  reportElement.style.margin = '0';
  reportElement.style.backgroundColor = '#0F111A';
  reportElement.style.color = '#FFFFFF';
  reportElement.style.maxWidth = '100%';
  reportElement.style.minHeight = '100vh'; // Ensure dark background covers full page
  
  // Add stylesheet for Montserrat font
  const montserratStyle = document.createElement('style');
  montserratStyle.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');
    * { font-family: 'Montserrat', sans-serif; }
  `;
  reportElement.appendChild(montserratStyle);
  
  return reportElement;
};

/**
 * Adds the header section to the PDF report
 */
const addHeaderToReport = (container: HTMLElement, title: string, date: string): void => {
  const header = document.createElement('div');
  header.className = 'pdf-header';
  header.style.textAlign = 'center';
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '20px';
  
  const titleElement = document.createElement('div');
  titleElement.style.fontSize = '24px';
  titleElement.innerHTML = `${title}<br/>${date}`;
  
  header.appendChild(titleElement);
  container.appendChild(header);
};

/**
 * Adds the winners banner to the PDF report, styled like the WinnerBanner component
 */
const addWinnersBanner = (
  container: HTMLElement, 
  winners: Player[], 
  allDrawnNumbers: number[],
  themeColor: string
): void => {
  // Get winning combinations (6 hits)
  const winningEntries = winners.flatMap(winner => 
    winner.combinations
      .filter(combo => combo.hits === 6)
      .map(combo => ({ 
        playerName: winner.name, 
        numbers: combo.numbers 
      }))
  );

  if (!winningEntries.length) return;

  // Create banner container
  const bannerContainer = document.createElement('div');
  bannerContainer.className = 'pdf-winner-banner';
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
  trophyLeft.style.fontSize = '18px';

  const bannerTitle = document.createElement('h2');
  bannerTitle.textContent = winners.length > 1 ? 'Vencedores Encontrados!' : 'Vencedor Encontrado!';
  bannerTitle.style.fontSize = '20px';
  bannerTitle.style.fontWeight = 'bold';
  bannerTitle.style.color = '#25C17E';
  bannerTitle.style.margin = '0';
  
  const trophyRight = document.createElement('div');
  trophyRight.innerHTML = '🏆';
  trophyRight.style.color = '#25C17E';
  trophyRight.style.fontSize = '18px';
  
  bannerHeader.appendChild(trophyLeft);
  bannerHeader.appendChild(bannerTitle);
  bannerHeader.appendChild(trophyRight);
  bannerContent.appendChild(bannerHeader);
  
  // Winners grid
  const winnersGrid = document.createElement('div');
  winnersGrid.style.display = 'grid';
  winnersGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
  winnersGrid.style.gap = '12px';
  
  winningEntries.forEach((entry, index) => {
    const entryBox = document.createElement('div');
    entryBox.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
    entryBox.style.padding = '12px';
    entryBox.style.borderRadius = '8px';
    entryBox.style.border = '1px solid rgba(34, 197, 94, 0.5)';
    
    const playerName = document.createElement('p');
    playerName.textContent = entry.playerName;
    playerName.style.fontWeight = '600';
    playerName.style.fontSize = '14px';
    playerName.style.marginBottom = '8px';
    playerName.style.color = '#22c55e'; // Verde mais claro
    
    const numbersContainer = document.createElement('div');
    numbersContainer.style.display = 'flex';
    numbersContainer.style.flexWrap = 'wrap';
    numbersContainer.style.gap = '6px';
    numbersContainer.style.justifyContent = 'center';
    
    entry.numbers.forEach(number => {
      const ball = createNumberBall(number, themeColor, true);
      numbersContainer.appendChild(ball);
    });
    
    entryBox.appendChild(playerName);
    entryBox.appendChild(numbersContainer);
    winnersGrid.appendChild(entryBox);
  });
  
  bannerContent.appendChild(winnersGrid);
  bannerContainer.appendChild(bannerContent);
  container.appendChild(bannerContainer);
};

/**
 * Creates a number ball with proper vertical alignment
 */
const createNumberBall = (number: number, color: string, isHit: boolean): HTMLElement => {
  const ball = document.createElement('div');
  ball.className = 'pdf-number-ball';
  ball.style.width = '40px';
  ball.style.height = '40px';
  ball.style.borderRadius = '50%';
  ball.style.display = 'flex';
  ball.style.justifyContent = 'center';
  ball.style.alignItems = 'center';
  ball.style.fontWeight = 'bold';
  ball.style.fontSize = '16px';
  
  // Format number with leading zero
  const formattedNumber = String(number).padStart(2, '0');
  
  // Number styling based on hit status
  if (isHit) {
    ball.style.backgroundColor = color; // Green background for hit numbers
    ball.style.color = 'white'; // White text for contrast
    ball.style.border = `2px solid ${color}`;
  } else {
    ball.style.backgroundColor = '#1A1F2C';
    ball.style.color = '#FFFFFF';
    ball.style.border = `1px solid ${color}`;
  }
  
  // Create inner span for proper vertical centering
  const innerSpan = document.createElement('span');
  innerSpan.textContent = formattedNumber;
  innerSpan.style.display = 'flex';
  innerSpan.style.justifyContent = 'center';
  innerSpan.style.alignItems = 'center';
  innerSpan.style.height = '100%';
  // Apply a significant vertical adjustment to center the text (-7px)
  innerSpan.style.marginTop = '-7px'; 
  
  ball.appendChild(innerSpan);
  return ball;
};

/**
 * Adds all players to the report in a masonry layout
 */
const addPlayersToReport = (
  container: HTMLElement, 
  players: Player[],
  allDrawnNumbers: number[],
  themeColor: string
): void => {
  // Convert allDrawnNumbers to a Set for faster lookups
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Container for masonry layout
  const playersContainer = document.createElement('div');
  playersContainer.className = 'pdf-masonry';
  playersContainer.style.columnCount = '2';
  playersContainer.style.columnGap = '15px';
  
  players.forEach(player => {
    const playerBox = document.createElement('div');
    playerBox.className = 'pdf-player-box';
    playerBox.style.backgroundColor = '#1A1F2C';
    playerBox.style.borderRadius = '8px';
    playerBox.style.marginBottom = '15px';
    playerBox.style.overflow = 'hidden';
    playerBox.style.pageBreakInside = 'avoid';
    playerBox.style.breakInside = 'avoid';
    playerBox.style.display = 'inline-block';
    playerBox.style.width = '100%';
    
    // Player info section
    const playerContent = document.createElement('div');
    playerContent.style.padding = '16px';
    
    // Player name and info header
    const playerInfoSection = document.createElement('div');
    playerInfoSection.style.display = 'flex';
    playerInfoSection.style.flexDirection = 'column';
    playerInfoSection.style.marginBottom = '12px';
    
    const playerName = document.createElement('h3');
    playerName.textContent = player.name;
    playerName.style.fontSize = '16px';
    playerName.style.fontWeight = '600';
    playerName.style.margin = '0 0 4px 0';
    
    const maxHits = Math.max(...player.combinations.map(c => c.hits), 0);
    const playerInfo = document.createElement('p');
    playerInfo.textContent = `${player.combinations.length} sequência${player.combinations.length !== 1 ? 's' : ''} | Acertos máximos: ${maxHits}`;
    playerInfo.style.fontSize = '12px';
    playerInfo.style.color = '#9ca3af'; // text-muted-foreground
    playerInfo.style.margin = '0';
    
    playerInfoSection.appendChild(playerName);
    playerInfoSection.appendChild(playerInfo);
    playerContent.appendChild(playerInfoSection);
    
    // Combinations section
    const combinationsContainer = document.createElement('div');
    combinationsContainer.style.display = 'flex';
    combinationsContainer.style.flexDirection = 'column';
    combinationsContainer.style.gap = '8px';
    
    if (player.combinations && player.combinations.length > 0) {
      player.combinations.forEach(combo => {
        const comboRow = document.createElement('div');
        comboRow.style.display = 'flex';
        comboRow.style.flexWrap = 'wrap';
        comboRow.style.gap = '6px';
        comboRow.style.padding = '8px';
        comboRow.style.backgroundColor = 'rgba(217, 217, 217, 0.1)'; // bg-muted/40
        comboRow.style.borderRadius = '6px';
        comboRow.style.justifyContent = 'flex-start';
        
        // Create balls for each number
        combo.numbers.sort((a, b) => a - b).forEach(number => {
          const isNumberHit = drawnNumbersSet.has(number);
          const ball = createNumberBall(number, themeColor, isNumberHit);
          ball.style.width = '32px'; // Smaller for the player cards
          ball.style.height = '32px';
          comboRow.appendChild(ball);
        });
        
        combinationsContainer.appendChild(comboRow);
      });
    }
    
    playerContent.appendChild(combinationsContainer);
    playerBox.appendChild(playerContent);
    playersContainer.appendChild(playerBox);
  });
  
  container.appendChild(playersContainer);
};
