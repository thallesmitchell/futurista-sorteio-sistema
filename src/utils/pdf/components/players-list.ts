
import { Player } from '@/contexts/game/types';
import { createNumberBall } from './number-ball';

/**
 * Adds all players to the report in a masonry layout
 */
export const addPlayersToReport = (
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
  playersContainer.style.backgroundColor = '#020817'; // Updated to match container background
  
  // Important - sort players alphabetically to maintain consistency
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  
  sortedPlayers.forEach(player => {
    const playerBox = document.createElement('div');
    playerBox.className = 'pdf-player-box';
    playerBox.style.backgroundColor = '#0D1526'; // Updated box background color
    playerBox.style.borderRadius = '8px';
    playerBox.style.marginBottom = '15px';
    playerBox.style.overflow = 'hidden';
    playerBox.style.pageBreakInside = 'avoid';
    playerBox.style.breakInside = 'avoid';
    playerBox.style.display = 'inline-block';
    playerBox.style.width = '100%';
    playerBox.style.border = '1px solid #172842'; // Updated border color
    
    // Player box header with name - highlighted to be more visible
    const playerHeader = document.createElement('div');
    playerHeader.style.backgroundColor = '#0D1526'; // Match box background
    playerHeader.style.padding = '10px 12px';
    playerHeader.style.borderBottom = '1px solid #172842'; // Updated border color
    
    // Create a player name header that stands out more
    const playerName = document.createElement('h3');
    playerName.textContent = player.name; // Player name clearly visible
    playerName.style.fontSize = '18px'; // Larger font size
    playerName.style.fontWeight = '800'; // Extra bold
    playerName.style.margin = '0';
    playerName.style.color = '#FFFFFF'; // White text for better visibility
    playerName.style.textAlign = 'center'; // Center the player name
    
    playerHeader.appendChild(playerName);
    playerBox.appendChild(playerHeader);
    
    // Player info section
    const playerContent = document.createElement('div');
    playerContent.style.padding = '12px';
    
    // Player info with combinations count
    const playerInfoSection = document.createElement('div');
    playerInfoSection.style.display = 'flex';
    playerInfoSection.style.flexDirection = 'column';
    playerInfoSection.style.marginBottom = '12px';
    playerInfoSection.style.textAlign = 'center'; // Center the info
    
    const maxHits = Math.max(...player.combinations.map(c => c.hits), 0);
    const playerInfo = document.createElement('p');
    playerInfo.textContent = `${player.combinations.length} sequência${player.combinations.length !== 1 ? 's' : ''} | Acertos máximos: ${maxHits}`;
    playerInfo.style.fontSize = '14px'; // Larger for better visibility
    playerInfo.style.color = '#5C719B'; // Updated text color to match design
    playerInfo.style.margin = '0';
    playerInfo.style.fontWeight = '600'; // Make it bolder
    
    playerInfoSection.appendChild(playerInfo);
    playerContent.appendChild(playerInfoSection);
    
    // Combinations section
    const combinationsContainer = document.createElement('div');
    combinationsContainer.style.display = 'flex';
    combinationsContainer.style.flexDirection = 'column';
    combinationsContainer.style.gap = '4px'; // REDUCED GAP HERE to fix spacing issue
    
    if (player.combinations && player.combinations.length > 0) {
      player.combinations.forEach((combo, comboIndex) => {
        const comboContainer = document.createElement('div');
        comboContainer.style.display = 'flex';
        comboContainer.style.flexDirection = 'column';
        comboContainer.style.gap = '4px'; // REDUCED GAP HERE
        comboContainer.style.padding = '6px'; // REDUCED PADDING HERE
        comboContainer.style.backgroundColor = '#0D1526'; // Updated background color
        comboContainer.style.borderRadius = '6px';
        comboContainer.style.border = '1px solid #172842'; // Added border
        
        // IMPORTANT: Add sequence number label (smaller and less prominent)
        const sequenceLabel = document.createElement('div');
        sequenceLabel.textContent = `Sequência ${comboIndex + 1}`;
        sequenceLabel.style.fontSize = '11px';
        sequenceLabel.style.color = '#8899AA';
        sequenceLabel.style.fontWeight = '500';
        sequenceLabel.style.marginBottom = '2px'; // REDUCED MARGIN
        sequenceLabel.style.textAlign = 'center';
        comboContainer.appendChild(sequenceLabel);
        
        // Numbers row
        const comboRow = document.createElement('div');
        comboRow.style.display = 'flex';
        comboRow.style.flexWrap = 'wrap';
        comboRow.style.gap = '4px'; // REDUCED GAP
        comboRow.style.justifyContent = 'center'; // Center the combinations
        
        // Sort numbers for consistency
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        
        // Create balls for each number
        sortedNumbers.forEach(number => {
          const isNumberHit = drawnNumbersSet.has(number);
          const ball = createNumberBall(number, themeColor, isNumberHit);
          ball.style.width = '30px'; // SMALLER for more compact layout
          ball.style.height = '30px'; // SMALLER for more compact layout
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
  
  container.appendChild(playersContainer);
};
