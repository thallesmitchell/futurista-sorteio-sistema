
import { createNumberBall } from './number-ball';

/**
 * Creates a combination row with properly styled numbers
 * Only the hit numbers are green, others remain standard
 */
export const createPlayerCombination = (
  numbers: number[],
  drawnNumbersSet: Set<number>,
  themeColor: string
): HTMLElement => {
  // Container for the numbers
  const comboRow = document.createElement('div');
  comboRow.style.display = 'flex';
  comboRow.style.flexWrap = 'wrap';
  comboRow.style.gap = '4px';
  comboRow.style.justifyContent = 'center';
  
  // Sort numbers for consistency
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  
  // Create balls for each number
  sortedNumbers.forEach(number => {
    // Check if this specific number is a hit
    const isNumberHit = drawnNumbersSet.has(number);
    
    // Create the appropriately styled ball
    const ball = createNumberBall(number, themeColor, isNumberHit);
    comboRow.appendChild(ball);
  });
  
  return comboRow;
};
