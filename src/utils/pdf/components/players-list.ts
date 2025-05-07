
import { Player } from '@/contexts/game/types';
import { createPlayerCombination } from './player-combination';

/**
 * Adds all players to the report in a simple table layout
 */
export const addPlayersToReport = (
  container: HTMLElement, 
  players: Player[],
  allDrawnNumbers: number[],
  themeColor: string
): void => {
  // Convert allDrawnNumbers to a Set for faster lookups
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Create table element
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '20px';
  
  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  // Create header cells
  const playerHeader = document.createElement('th');
  playerHeader.textContent = 'Jogador';
  playerHeader.style.padding = '8px';
  playerHeader.style.textAlign = 'left';
  playerHeader.style.backgroundColor = '#333';
  playerHeader.style.color = '#fff';
  
  const detailsHeader = document.createElement('th');
  detailsHeader.textContent = 'Detalhes';
  detailsHeader.style.padding = '8px';
  detailsHeader.style.textAlign = 'left';
  detailsHeader.style.backgroundColor = '#333';
  detailsHeader.style.color = '#fff';
  
  const sequencesHeader = document.createElement('th');
  sequencesHeader.textContent = 'Sequências';
  sequencesHeader.style.padding = '8px';
  sequencesHeader.style.textAlign = 'left';
  sequencesHeader.style.backgroundColor = '#333';
  sequencesHeader.style.color = '#fff';
  
  // Append header cells to header row
  headerRow.appendChild(playerHeader);
  headerRow.appendChild(detailsHeader);
  headerRow.appendChild(sequencesHeader);
  
  // Append header row to thead
  thead.appendChild(headerRow);
  
  // Append thead to table
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  // Important - sort players alphabetically for consistency
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  
  sortedPlayers.forEach((player, playerIndex) => {
    // Player name row
    const playerRow = document.createElement('tr');
    
    // If odd row, add background color
    if (playerIndex % 2 === 0) {
      playerRow.style.backgroundColor = '#f9f9f9';
    }
    
    const playerNameCell = document.createElement('td');
    playerNameCell.textContent = player.name;
    playerNameCell.style.padding = '8px';
    playerNameCell.style.fontWeight = 'bold';
    playerNameCell.style.verticalAlign = 'top';
    playerNameCell.rowSpan = player.combinations.length || 1;
    
    const playerDetailsCell = document.createElement('td');
    playerDetailsCell.style.padding = '8px';
    playerDetailsCell.style.verticalAlign = 'top';
    
    const detailsText = document.createElement('div');
    detailsText.textContent = `${player.combinations.length} sequência${player.combinations.length !== 1 ? 's' : ''}`;
    playerDetailsCell.appendChild(detailsText);
    
    const maxHitsText = document.createElement('div');
    const maxHits = Math.max(...player.combinations.map(c => c.hits), 0);
    maxHitsText.textContent = `Máx. acertos: ${maxHits}`;
    playerDetailsCell.appendChild(maxHitsText);
    
    playerNameCell.rowSpan = player.combinations.length || 1;
    playerDetailsCell.rowSpan = player.combinations.length || 1;
    
    playerRow.appendChild(playerNameCell);
    playerRow.appendChild(playerDetailsCell);
    
    // Add combinations
    if (player.combinations && player.combinations.length > 0) {
      // First combination in the same row as player name
      const firstComboCell = document.createElement('td');
      firstComboCell.style.padding = '8px';
      
      const hitsText = document.createElement('div');
      hitsText.textContent = `${player.combinations[0].hits} acerto${player.combinations[0].hits !== 1 ? 's' : ''}:`;
      firstComboCell.appendChild(hitsText);
      
      const comboRow = createPlayerCombination(player.combinations[0].numbers, drawnNumbersSet, themeColor);
      firstComboCell.appendChild(comboRow);
      
      playerRow.appendChild(firstComboCell);
      tbody.appendChild(playerRow);
      
      // Remaining combinations in separate rows
      for (let i = 1; i < player.combinations.length; i++) {
        const combo = player.combinations[i];
        const comboRow = document.createElement('tr');
        
        // If odd row, add background color
        if ((playerIndex + i) % 2 === 0) {
          comboRow.style.backgroundColor = '#f9f9f9';
        }
        
        const comboCell = document.createElement('td');
        comboCell.style.padding = '8px';
        
        const hitsText = document.createElement('div');
        hitsText.textContent = `${combo.hits} acerto${combo.hits !== 1 ? 's' : ''}:`;
        comboCell.appendChild(hitsText);
        
        const comboElement = createPlayerCombination(combo.numbers, drawnNumbersSet, themeColor);
        comboCell.appendChild(comboElement);
        
        comboRow.appendChild(comboCell);
        tbody.appendChild(comboRow);
      }
    } else {
      // If no combinations, add empty cell
      const emptyCell = document.createElement('td');
      emptyCell.style.padding = '8px';
      emptyCell.textContent = 'Nenhuma sequência';
      
      playerRow.appendChild(emptyCell);
      tbody.appendChild(playerRow);
    }
    
    // Add thick dashed separator after each player (except the last)
    if (playerIndex < sortedPlayers.length - 1) {
      const separatorRow = document.createElement('tr');
      const separatorCell = document.createElement('td');
      separatorCell.colSpan = 3;
      separatorCell.style.padding = '0';
      
      const separator = document.createElement('hr');
      separator.style.border = 'none';
      separator.style.borderTop = '3px dashed #172842';
      separator.style.margin = '8px 0';
      separator.style.width = '100%';
      
      separatorCell.appendChild(separator);
      separatorRow.appendChild(separatorCell);
      tbody.appendChild(separatorRow);
    }
  });
  
  // Append tbody to table
  table.appendChild(tbody);
  
  // Append table to container
  container.appendChild(table);
};
