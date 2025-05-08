
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
  
  const nearWinners = game.players
    .filter(player => player.combinations && Array.isArray(player.combinations) && 
      player.combinations.some(combo => combo.hits === 5))
    .map(player => {
      const nearWinningCombos = player.combinations.filter(combo => combo.hits === 5);
      console.log(`Player ${player.name} has ${nearWinningCombos.length} near-winning combinations`);
      return { player, combos: nearWinningCombos };
    })
    .filter(item => item.combos.length > 0);

  console.log(`Total near winners found: ${nearWinners.length}`);
  return nearWinners;
};

/**
 * Format a number with a leading zero if needed
 */
const formatNumber = (num: number): string => {
  return num < 10 ? `0${num}` : String(num);
};

/**
 * Create table data structure for near winners
 * Returns an array of [playerName, formattedNumbersSequence] entries
 */
export const createNearWinnersTableData = (
  nearWinners: Array<{player: any, combos: any[]}>,
  drawnNumbersSet: Set<number>
): Array<[string, string]> => {
  // Create an array to hold our table rows
  const tableData: Array<[string, string]> = [];
  
  console.log(`Creating table data for ${nearWinners.length} near winners`);
  
  for (const item of nearWinners) {
    const { player, combos } = item;
    
    // For each combination with 5 hits
    for (const combo of combos) {
      // Sort the numbers for better display
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Format each number and mark hits with asterisks for highlighting
      const formattedSequence = sortedNumbers.map(num => {
        const isHit = drawnNumbersSet.has(num);
        const formattedNum = formatNumber(num);
        // Mark hit numbers with asterisks for later highlighting
        return isHit ? `*${formattedNum}*` : formattedNum;
      }).join(' ');
      
      console.log(`Adding near winner row for ${player.name} with sequence: ${formattedSequence}`);
      
      // Add this row to our table data
      tableData.push([
        player.name,
        formattedSequence
      ]);
    }
  }
  
  console.log(`Generated ${tableData.length} rows for near winners table`);
  return tableData;
};
