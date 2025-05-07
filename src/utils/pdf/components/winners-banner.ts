
import { WinningEntry } from '../types';
import { createNumberBall } from './number-ball';

/**
 * Adds the winners banner to the PDF report, styled like the WinnerBanner component
 */
export const addWinnersBanner = (
  container: HTMLElement, 
  winners: any[], // Using any here because we already filter to winning entries
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
  trophyLeft.style.fontSize = '24px'; // Larger trophy icons

  const bannerTitle = document.createElement('h2');
  bannerTitle.textContent = 'Saiu Ganhador!';
  bannerTitle.style.fontSize = '24px'; // Larger text
  bannerTitle.style.fontWeight = 'bold';
  bannerTitle.style.color = '#25C17E';
  bannerTitle.style.margin = '0';
  
  const trophyRight = document.createElement('div');
  trophyRight.innerHTML = '🏆';
  trophyRight.style.color = '#25C17E';
  trophyRight.style.fontSize = '24px'; // Larger trophy icons
  
  bannerHeader.appendChild(trophyLeft);
  bannerHeader.appendChild(bannerTitle);
  bannerHeader.appendChild(trophyRight);
  bannerContent.appendChild(bannerHeader);
  
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
    playerName.style.fontSize = '20px'; // Larger text
    playerName.style.marginBottom = '10px';
    playerName.style.color = '#22c55e'; // Verde mais claro
    playerName.style.textAlign = 'center'; // Center player name
    
    const numbersContainer = document.createElement('div');
    numbersContainer.style.display = 'flex';
    numbersContainer.style.flexWrap = 'wrap';
    numbersContainer.style.gap = '6px';
    numbersContainer.style.justifyContent = 'center';
    
    // Important: Sort the numbers to maintain consistency
    const sortedNumbers = [...entry.numbers].sort((a, b) => a - b);
    
    sortedNumbers.forEach(number => {
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
