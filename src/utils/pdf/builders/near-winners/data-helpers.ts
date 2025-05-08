
import { Game } from '@/contexts/game/types';

/**
 * Find players who have combinations with exactly 5 hits
 */
export const findNearWinners = (game: Game) => {
  return game.players
    .filter(player => player.combinations.some(combo => combo.hits === 5))
    .map(player => {
      const nearWinningCombos = player.combinations.filter(combo => combo.hits === 5);
      return { player, combos: nearWinningCombos };
    })
    .filter(item => item.combos.length > 0);
};

/**
 * Create table data structure for near winners
 */
export const createNearWinnersTableData = (
  nearWinners: Array<{player: any, combos: any[]}>,
  drawnNumbersSet: Set<number>
): any[] => {
  const tableData = [];
  
  for (const item of nearWinners) {
    const { player, combos } = item;
    
    // For each combination with 5 hits
    for (const combo of combos) {
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Create a row with player name and formatted numbers
      const row = [
        player.name,
        sortedNumbers.map(num => {
          const isHit = drawnNumbersSet.has(num);
          const formattedNum = formatNumber(num);
          return isHit ? `*${formattedNum}*` : formattedNum;
        }).join(' ')
      ];
      
      tableData.push(row);
    }
  }
  
  return tableData;
};

/**
 * Format a number with a leading zero if needed
 */
const formatNumber = (num: number): string => {
  return String(num).padStart(2, '0');
};
