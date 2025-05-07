
import { Player } from '@/contexts/game/types';
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
  sectionContainer.style.marginBottom = '20px';
  
  // Section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'Jogos Amarrados';
  sectionTitle.style.color = themeColor;
  sectionTitle.style.textAlign = 'center';
  sectionTitle.style.margin = '0 0 10px 0';
  sectionContainer.appendChild(sectionTitle);
  
  // Section description
  const sectionDesc = document.createElement('p');
  sectionDesc.textContent = 'Jogadores com 5 acertos (falta apenas 1 número para ganhar)';
  sectionDesc.style.textAlign = 'center';
  sectionDesc.style.margin = '0 0 15px 0';
  sectionContainer.appendChild(sectionDesc);
  
  // Convert allDrawnNumbers to a Set for faster lookups
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Create table for near winners
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  
  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const playerHeader = document.createElement('th');
  playerHeader.textContent = 'Jogador';
  playerHeader.style.padding = '8px';
  playerHeader.style.backgroundColor = '#333';
  playerHeader.style.color = '#fff';
  playerHeader.style.textAlign = 'left';
  
  const combosHeader = document.createElement('th');
  combosHeader.textContent = 'Sequências com 5 acertos';
  combosHeader.style.padding = '8px';
  combosHeader.style.backgroundColor = '#333';
  combosHeader.style.color = '#fff';
  combosHeader.style.textAlign = 'left';
  
  headerRow.appendChild(playerHeader);
  headerRow.appendChild(combosHeader);
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  nearWinners.forEach((item, index) => {
    const row = document.createElement('tr');
    
    // Alternate row color
    if (index % 2 === 0) {
      row.style.backgroundColor = '#f9f9f9';
    }
    
    const playerCell = document.createElement('td');
    playerCell.textContent = item.player.name;
    playerCell.style.padding = '8px';
    playerCell.style.fontWeight = 'bold';
    playerCell.style.verticalAlign = 'top';
    
    const combosCell = document.createElement('td');
    combosCell.style.padding = '8px';
    
    item.combos.forEach((combo, comboIndex) => {
      if (comboIndex > 0) {
        const separator = document.createElement('hr');
        separator.style.margin = '5px 0';
        separator.style.border = 'none';
        separator.style.borderTop = '1px solid #ccc';
        combosCell.appendChild(separator);
      }
      
      const comboRow = createPlayerCombination(combo.numbers, drawnNumbersSet, themeColor);
      combosCell.appendChild(comboRow);
    });
    
    row.appendChild(playerCell);
    row.appendChild(combosCell);
    tbody.appendChild(row);
    
    // Add separator between players
    if (index < nearWinners.length - 1) {
      const separatorRow = document.createElement('tr');
      const separatorCell = document.createElement('td');
      separatorCell.colSpan = 2;
      separatorCell.style.padding = '0';
      
      const separator = document.createElement('hr');
      separator.style.border = 'none';
      separator.style.borderTop = '3px dashed #172842';
      separator.style.margin = '8px 0';
      
      separatorCell.appendChild(separator);
      separatorRow.appendChild(separatorCell);
      tbody.appendChild(separatorRow);
    }
  });
  
  table.appendChild(tbody);
  sectionContainer.appendChild(table);
  container.appendChild(sectionContainer);
};
