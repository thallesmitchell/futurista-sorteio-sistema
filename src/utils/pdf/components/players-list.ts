
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
  playersContainer.style.backgroundColor = '#0F111A'; // Ensure dark background
  
  // Important - sort players alphabetically to maintain consistency
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  
  sortedPlayers.forEach(player => {
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
    
    // Player box header with name - highlighted to be more visible
    const playerHeader = document.createElement('div');
    playerHeader.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    playerHeader.style.padding = '10px 12px';
    playerHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    
    const playerName = document.createElement('h3');
    playerName.textContent = player.name; // Player name clearly visible
    playerName.style.fontSize = '16px';
    playerName.style.fontWeight = '700'; // Make font bolder
    playerName.style.margin = '0';
    playerName.style.color = '#FFFFFF';
    playerName.style.textAlign = 'left'; // Ensure name is aligned left
    
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
    
    const maxHits = Math.max(...player.combinations.map(c => c.hits), 0);
    const playerInfo = document.createElement('p');
    playerInfo.textContent = `${player.combinations.length} sequência${player.combinations.length !== 1 ? 's' : ''} | Acertos máximos: ${maxHits}`;
    playerInfo.style.fontSize = '12px';
    playerInfo.style.color = '#9ca3af'; // text-muted-foreground
    playerInfo.style.margin = '0';
    
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
        comboRow.style.justifyContent = 'center'; // Center the combinations
        
        // Sort numbers for consistency
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        
        // Create balls for each number
        sortedNumbers.forEach(number => {
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
