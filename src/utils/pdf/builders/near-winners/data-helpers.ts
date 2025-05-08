
import { Game } from '@/contexts/game/types';

/**
 * Find players who have combinations with exactly 5 hits
 */
export const findNearWinners = (game: Game) => {
  if (!game || !Array.isArray(game.players)) {
    console.warn('Invalid game data in findNearWinners');
    return [];
  }

  // Debug log to check player counts
  console.log(`Checking near winners among ${game.players.length} players`);
  
  return game.players
    .filter(player => player.combinations && Array.isArray(player.combinations) && 
      player.combinations.some(combo => combo.hits === 5))
    .map(player => {
      const nearWinningCombos = player.combinations.filter(combo => combo.hits === 5);
      console.log(`Player ${player.name} has ${nearWinningCombos.length} near-winning combinations`);
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
  
  // Debug log
  console.log(`Creating table data for ${nearWinners.length} near winners`);
  
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
  
  console.log(`Generated ${tableData.length} rows for near winners table`);
  return tableData;
};

/**
 * Format a number with a leading zero if needed
 */
const formatNumber = (num: number): string => {
  return String(num).padStart(2, '0');
};
