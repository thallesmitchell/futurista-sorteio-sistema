
import html2pdf from 'html2pdf.js';
import { Game, Player } from '@/contexts/GameContext';

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
  
  // Add winners section if there are winners
  if (winners.length > 0) {
    addWinnersToReport(reportElement, winners, allDrawnNumbers, options.themeColor || '#25C17E');
  }
  
  // Add players in masonry layout
  const regularPlayers = [...game.players]
    .filter(p => !winnerIds.includes(p.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  addPlayersToReport(reportElement, regularPlayers, allDrawnNumbers);
  
  // Generate PDF with specific options
  const pdfOptions = {
    margin: 0, // Remove margins completely
    filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${game.name.replace(/\s+/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true,
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
  reportElement.style.fontFamily = 'Orbitron, sans-serif';
  reportElement.style.padding = '20px';
  reportElement.style.margin = '0';
  reportElement.style.backgroundColor = '#0F111A';
  reportElement.style.color = '#FFFFFF';
  reportElement.style.maxWidth = '100%';
  reportElement.style.minHeight = '100vh'; // Ensure dark background covers full page
  
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
 * Adds the winners section to the PDF report
 */
const addWinnersToReport = (
  container: HTMLElement, 
  winners: Player[], 
  allDrawnNumbers: number[],
  themeColor: string
): void => {
  winners.forEach(winner => {
    const winningCombos = winner.combinations.filter(combo => combo.hits === 6);
    
    winningCombos.forEach((winningCombo, index) => {
      const winnerBox = document.createElement('div');
      winnerBox.className = 'pdf-winner-box';
      winnerBox.style.backgroundColor = themeColor;
      winnerBox.style.borderRadius = '8px';
      winnerBox.style.marginBottom = '20px';
      winnerBox.style.overflow = 'hidden';
      winnerBox.style.pageBreakInside = 'avoid';
      winnerBox.style.breakInside = 'avoid';
      winnerBox.style.width = '100%'; // Make winner box full width
      
      // Winner header with trophy icons
      const winnerHeader = document.createElement('div');
      winnerHeader.className = 'pdf-winner-header';
      winnerHeader.innerHTML = `🏆 VENCEDOR - ${winner.name} 🏆`;
      winnerHeader.style.backgroundColor = themeColor;
      winnerHeader.style.color = '#FFFFFF';
      winnerHeader.style.padding = '15px';
      winnerHeader.style.fontWeight = 'bold';
      winnerHeader.style.textAlign = 'center';
      winnerHeader.style.fontSize = '20px';
      winnerBox.appendChild(winnerHeader);
      
      // Winner numbers
      const numbersContainer = document.createElement('div');
      numbersContainer.style.padding = '20px';
      numbersContainer.style.backgroundColor = 'rgba(0,0,0,0.2)';
      numbersContainer.style.display = 'flex';
      numbersContainer.style.flexWrap = 'wrap';
      numbersContainer.style.justifyContent = 'center';
      numbersContainer.style.gap = '12px';
      
      winningCombo.numbers.forEach(number => {
        const ball = document.createElement('div');
        ball.className = 'pdf-number-ball';
        ball.style.width = '40px';
        ball.style.height = '40px';
        ball.style.borderRadius = '50%';
        ball.style.display = 'inline-flex';
        ball.style.justifyContent = 'center';
        ball.style.alignItems = 'center';
        ball.style.fontWeight = 'bold';
        ball.style.fontSize = '16px';
        ball.style.lineHeight = '40px'; // Center text vertically
        ball.style.textAlign = 'center'; // Center text horizontally
        
        // Format number with leading zero
        const formattedNumber = String(number).padStart(2, '0');
        
        // All numbers are hits in winning combination
        ball.style.backgroundColor = 'white';
        ball.style.color = themeColor;
        ball.style.border = `2px solid ${themeColor}`;
        
        ball.textContent = formattedNumber;
        numbersContainer.appendChild(ball);
      });
      
      winnerBox.appendChild(numbersContainer);
      container.appendChild(winnerBox);
    });
  });
};

/**
 * Adds all regular players to the report in a masonry layout
 */
const addPlayersToReport = (
  container: HTMLElement, 
  players: Player[],
  allDrawnNumbers: number[]
): void => {
  // Container for masonry layout
  const playersContainer = document.createElement('div');
  playersContainer.className = 'pdf-masonry';
  playersContainer.style.columnCount = '2';
  playersContainer.style.columnGap = '15px';
  
  players.forEach(player => {
    const playerBox = document.createElement('div');
    playerBox.className = 'pdf-player-box';
    playerBox.style.backgroundColor = '#1A1F2C'; // Darker background
    playerBox.style.borderRadius = '8px';
    playerBox.style.marginBottom = '15px';
    playerBox.style.overflow = 'hidden';
    playerBox.style.pageBreakInside = 'avoid';
    playerBox.style.breakInside = 'avoid';
    
    // Player name header
    const playerHeader = document.createElement('div');
    playerHeader.className = 'pdf-player-header';
    playerHeader.style.backgroundColor = '#1A3F34';
    playerHeader.style.color = '#FFFFFF';
    playerHeader.style.padding = '10px';
    playerHeader.style.fontWeight = 'bold';
    playerHeader.style.textAlign = 'center';
    playerHeader.textContent = player.name;
    playerBox.appendChild(playerHeader);
    
    // Player combinations content
    const combinationsContainer = document.createElement('div');
    combinationsContainer.style.padding = '10px';
    combinationsContainer.style.backgroundColor = '#1A1F2C'; // Darker background
    
    if (player.combinations && player.combinations.length > 0) {
      player.combinations.forEach((combo, index) => {
        const comboRow = document.createElement('div');
        comboRow.className = 'pdf-combo-row';
        comboRow.style.backgroundColor = '#2A2F3C'; // Darker background for combo row
        comboRow.style.margin = '0 0 10px 0';
        comboRow.style.padding = '10px';
        comboRow.style.display = 'flex';
        comboRow.style.flexWrap = 'wrap';
        comboRow.style.justifyContent = 'center';
        comboRow.style.gap = '8px';
        comboRow.style.borderRadius = '4px';
        
        // Create balls for each number
        combo.numbers.sort((a, b) => a - b).forEach(number => {
          const isHit = allDrawnNumbers.includes(number);
          
          const ball = document.createElement('div');
          ball.className = isHit ? 'pdf-number-hit' : 'pdf-number-miss';
          ball.style.width = '32px';
          ball.style.height = '32px';
          ball.style.borderRadius = '50%';
          ball.style.display = 'inline-flex';
          ball.style.justifyContent = 'center';
          ball.style.alignItems = 'center';
          ball.style.fontSize = '14px';
          ball.style.lineHeight = '32px'; // Center text vertically
          ball.style.textAlign = 'center'; // Center text horizontally
          
          // Format number with leading zero
          const formattedNumber = String(number).padStart(2, '0');
          
          if (isHit) {
            ball.style.backgroundColor = '#25C17E';
            ball.style.color = '#FFFFFF';
          } else {
            ball.style.backgroundColor = '#1A1F2C';
            ball.style.color = '#FFFFFF';
            ball.style.border = '1px solid #25C17E';
          }
          
          ball.textContent = formattedNumber;
          comboRow.appendChild(ball);
        });
        
        // No hits label as requested by the user
        
        combinationsContainer.appendChild(comboRow);
      });
    } else {
      const noCombo = document.createElement('p');
      noCombo.textContent = 'Sem combinações';
      noCombo.style.textAlign = 'center';
      noCombo.style.padding = '10px';
      noCombo.style.color = '#999';
      combinationsContainer.appendChild(noCombo);
    }
    
    playerBox.appendChild(combinationsContainer);
    playersContainer.appendChild(playerBox);
  });
  
  container.appendChild(playersContainer);
};
