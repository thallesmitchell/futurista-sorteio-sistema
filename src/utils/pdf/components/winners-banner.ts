
import { Player } from '@/contexts/game/types';
import { createPlayerCombination } from './player-combination';

/**
 * Adds the winners banner to the PDF report in a simple layout
 */
export const addWinnersBanner = (
  container: HTMLElement, 
  winners: Player[], 
  allDrawnNumbers: number[],
  themeColor: string
): void => {
  if (!winners || winners.length === 0) return;
  
  // Convert allDrawnNumbers to a Set for faster lookups
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Create banner container
  const bannerContainer = document.createElement('div');
  bannerContainer.style.marginBottom = '20px';
  bannerContainer.style.padding = '10px';
  bannerContainer.style.border = '2px solid ' + themeColor;
  bannerContainer.style.borderRadius = '5px';
  
  // Banner title
  const bannerTitle = document.createElement('h2');
  bannerTitle.textContent = 'Vencedores';
  bannerTitle.style.textAlign = 'center';
  bannerTitle.style.color = themeColor;
  bannerTitle.style.margin = '0 0 10px 0';
  
  bannerContainer.appendChild(bannerTitle);
  
  // List of winners
  winners.forEach(winner => {
    const winnerCombos = winner.combinations.filter(combo => combo.hits === 6);
    if (winnerCombos.length === 0) return;
    
    const winnerContainer = document.createElement('div');
    winnerContainer.style.marginBottom = '15px';
    
    // Winner name
    const winnerName = document.createElement('h3');
    winnerName.textContent = winner.name;
    winnerName.style.margin = '0 0 5px 0';
    
    winnerContainer.appendChild(winnerName);
    
    // Winning combinations
    winnerCombos.forEach(combo => {
      const comboContainer = document.createElement('div');
      comboContainer.style.marginBottom = '5px';
      
      // Create the combination row
      const comboRow = createPlayerCombination(combo.numbers, drawnNumbersSet, themeColor);
      comboContainer.appendChild(comboRow);
      
      winnerContainer.appendChild(comboContainer);
    });
    
    bannerContainer.appendChild(winnerContainer);
  });
  
  container.appendChild(bannerContainer);
};
