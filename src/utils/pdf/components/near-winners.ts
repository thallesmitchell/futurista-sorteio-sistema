
import { Player } from '@/contexts/game/types';
import { createNumberBall } from './number-ball';
import { createPlayerCombination } from './player-combination';

/**
 * Adds the "Jogos Amarrados" section to the PDF report
 * Shows players with 5 hits (near winners)
 */
export const addNearWinnersSection = (
  container: HTMLElement,
  players: Player[],
  allDrawnNumbers: number[],
  themeColor: string
): void => {
  // Find players with combinations that have exactly 5 hits
  const nearWinners = players
    .filter(player => player.combinations.some(combo => combo.hits === 5))
    .map(player => {
      const nearWinningCombos = player.combinations.filter(combo => combo.hits === 5);
      return { player, combos: nearWinningCombos };
    })
    .filter(item => item.combos.length > 0);

  if (nearWinners.length === 0) return;

  // Create section container
  const sectionContainer = document.createElement('div');
  sectionContainer.className = 'near-winners-section';
  sectionContainer.style.marginBottom = '30px';
  sectionContainer.style.pageBreakInside = 'avoid';
  sectionContainer.style.breakInside = 'avoid';
  
  // Section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'Jogos Amarrados';
  sectionTitle.style.fontSize = '20px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.color = themeColor;
  sectionTitle.style.textAlign = 'center';
  sectionTitle.style.margin = '0 0 10px 0';
  sectionContainer.appendChild(sectionTitle);
  
  // Section description
  const sectionDesc = document.createElement('p');
  sectionDesc.textContent = 'Jogadores com 5 acertos (falta apenas 1 número para ganhar)';
  sectionDesc.style.fontSize = '14px';
  sectionDesc.style.color = '#8899AA';
  sectionDesc.style.textAlign = 'center';
  sectionDesc.style.margin = '0 0 20px 0';
  sectionContainer.appendChild(sectionDesc);
  
  // Convert allDrawnNumbers to a Set for faster lookups
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Add each near winner in a separate box
  nearWinners.forEach(item => {
    const playerBox = document.createElement('div');
    playerBox.style.backgroundColor = '#0D1526';
    playerBox.style.borderRadius = '8px';
    playerBox.style.border = '1px solid #172842';
    playerBox.style.padding = '15px';
    playerBox.style.marginBottom = '15px';
    playerBox.style.width = '100%'; // 100% width as requested
    
    // Player name
    const playerName = document.createElement('h3');
    playerName.textContent = item.player.name;
    playerName.style.fontSize = '18px';
    playerName.style.fontWeight = 'bold';
    playerName.style.margin = '0 0 15px 0';
    playerName.style.color = '#FFFFFF';
    playerName.style.textAlign = 'center';
    playerBox.appendChild(playerName);
    
    // Container for combinations
    const combosContainer = document.createElement('div');
    combosContainer.style.display = 'flex';
    combosContainer.style.flexDirection = 'column';
    combosContainer.style.gap = '15px';
    combosContainer.style.alignItems = 'center';
    
    // Show maximum 3 combinations, then indicate if there are more
    const maxToShow = 3;
    item.combos.slice(0, maxToShow).forEach(combo => {
      // Create a row with the near winning numbers
      const comboRow = document.createElement('div');
      comboRow.style.display = 'flex';
      comboRow.style.justifyContent = 'center';
      comboRow.style.gap = '20px'; // 20px between circles as requested
      
      // Sort numbers for consistency
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      sortedNumbers.forEach(number => {
        // Check if this number is in drawn numbers
        const isNumberHit = drawnNumbersSet.has(number);
        
        // Create a ball with increased size (10px larger)
        const ball = document.createElement('div');
        ball.style.width = '46px'; // 36px + 10px
        ball.style.height = '46px'; // 36px + 10px 
        ball.style.borderRadius = '50%';
        ball.style.display = 'flex';
        ball.style.justifyContent = 'center';
        ball.style.alignItems = 'center';
        ball.style.position = 'relative';
        
        // Format number with leading zero
        const formattedNumber = String(number).padStart(2, '0');
        
        // Style based on hit status
        if (isNumberHit) {
          ball.style.backgroundColor = themeColor;
          ball.style.color = 'white';
          ball.style.fontWeight = '900';
          ball.style.fontSize = '17px';
        } else {
          ball.style.backgroundColor = '#1A1F2C';
          ball.style.color = '#FFFFFF';
          ball.style.border = `1px solid ${themeColor}`;
          ball.style.fontWeight = '400';
          ball.style.fontSize = '16px';
        }
        
        // Inner span for proper vertical centering
        const innerSpan = document.createElement('span');
        innerSpan.textContent = formattedNumber;
        innerSpan.style.display = 'inline-block';
        innerSpan.style.textAlign = 'center';
        innerSpan.style.position = 'absolute';
        innerSpan.style.top = '50%';
        innerSpan.style.left = '50%';
        innerSpan.style.transform = 'translate(-50%, -50%)';
        
        ball.appendChild(innerSpan);
        comboRow.appendChild(ball);
      });
      
      combosContainer.appendChild(comboRow);
    });
    
    // If there are more combinations than shown, add a note
    if (item.combos.length > maxToShow) {
      const moreInfo = document.createElement('p');
      moreInfo.textContent = `+ ${item.combos.length - maxToShow} mais sequência${
        item.combos.length - maxToShow !== 1 ? 's' : ''
      } com 5 acertos`;
      moreInfo.style.fontSize = '13px';
      moreInfo.style.color = '#5C719B';
      moreInfo.style.margin = '5px 0 0 0';
      moreInfo.style.textAlign = 'center';
      moreInfo.style.fontStyle = 'italic';
      combosContainer.appendChild(moreInfo);
    }
    
    playerBox.appendChild(combosContainer);
    sectionContainer.appendChild(playerBox);
  });
  
  container.appendChild(sectionContainer);
};
