
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
  playersContainer.className = 'pdf-players-container';
  playersContainer.style.backgroundColor = '#020817';
  playersContainer.style.width = '100%';
  
  // Important - sort players alphabetically for consistency
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  
  sortedPlayers.forEach((player, playerIndex) => {
    const playerBox = document.createElement('div');
    playerBox.className = 'pdf-player-box';
    playerBox.style.backgroundColor = '#0D1526';
    playerBox.style.borderRadius = '8px';
    playerBox.style.marginBottom = '15px';
    playerBox.style.overflow = 'hidden';
    playerBox.style.pageBreakInside = 'avoid'; // Try to avoid breaks within a player
    playerBox.style.breakInside = 'avoid'; 
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
    
    // Player content section
    const playerContent = document.createElement('div');
    playerContent.style.padding = '12px';
    
    // Player info section with combinations count
    const playerInfoSection = document.createElement('div');
    playerInfoSection.style.display = 'flex';
    playerInfoSection.style.flexDirection = 'column';
    playerInfoSection.style.marginBottom = '10px';
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
    
    // Combinations section - show ALL combinations as requested
    const combinationsContainer = document.createElement('div');
    combinationsContainer.style.display = 'flex';
    combinationsContainer.style.flexDirection = 'column';
    combinationsContainer.style.gap = '10px';
    
    if (player.combinations && player.combinations.length > 0) {
      player.combinations.forEach((combo, comboIndex) => {
        const comboContainer = document.createElement('div');
        comboContainer.style.display = 'flex';
        comboContainer.style.flexDirection = 'column';
        comboContainer.style.gap = '6px';
        comboContainer.style.padding = '8px';
        comboContainer.style.backgroundColor = '#0D1526';
        comboContainer.style.borderRadius = '6px';
        comboContainer.style.border = '1px solid #172842';
        
        // Add sequence number label
        const sequenceLabel = document.createElement('div');
        sequenceLabel.textContent = `Sequência ${comboIndex + 1} - ${combo.hits} acerto${combo.hits !== 1 ? 's' : ''}`;
        sequenceLabel.style.fontSize = '13px';
        sequenceLabel.style.color = '#8899AA';
        sequenceLabel.style.fontWeight = '600';
        sequenceLabel.style.marginBottom = '4px';
        sequenceLabel.style.textAlign = 'center';
        comboContainer.appendChild(sequenceLabel);
        
        // Numbers row
        const comboRow = document.createElement('div');
        comboRow.style.display = 'flex';
        comboRow.style.flexWrap = 'wrap';
        comboRow.style.gap = '6px';
        comboRow.style.justifyContent = 'center';
        
        // Sort numbers for consistency
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        
        // Create balls for each number
        sortedNumbers.forEach(number => {
          const isNumberHit = drawnNumbersSet.has(number);
          const ball = createNumberBall(number, themeColor, isNumberHit);
          comboRow.appendChild(ball);
        });
        
        comboContainer.appendChild(comboRow);
        combinationsContainer.appendChild(comboContainer);
      });
    }
    
    playerContent.appendChild(combinationsContainer);
    playerBox.appendChild(playerContent);
    
    // Add dashed separator line after each player (except the last)
    if (playerIndex < sortedPlayers.length - 1) {
      const separator = document.createElement('hr');
      separator.style.border = 'none';
      separator.style.borderTop = '3px dashed #172842';
      separator.style.margin = '20px 0';
      separator.style.width = '100%';
      playerContent.appendChild(separator);
    }
    
    playersContainer.appendChild(playerBox);
  });
  
  container.appendChild(playersContainer);
};
