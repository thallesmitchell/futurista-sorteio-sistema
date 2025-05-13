
import { Player } from '@/contexts/game/types';

export interface NearWinner {
  playerName: string;
  numbers: number[];
  hits: number;
}

/**
 * Find players who are close to winning (have N hits in a single combination)
 */
export function findNearWinners(players: Player[], requiredHits: number = 5): NearWinner[] {
  console.log(`Finding near winners with ${requiredHits} hits`);
  
  if (!players || players.length === 0) {
    console.log('No players provided to findNearWinners');
    return [];
  }
  
  // Track near winners
  const nearWinners: NearWinner[] = [];
  
  // Process each player
  players.forEach(player => {
    if (!player.combinations || player.combinations.length === 0) {
      return;
    }
    
    // Find combinations with exactly the required number of hits
    const nearWinCombos = player.combinations.filter(combo => combo.hits === requiredHits);
    
    // Add each near-winning combination to the results
    nearWinCombos.forEach(combo => {
      nearWinners.push({
        playerName: player.name,
        numbers: [...combo.numbers].sort((a, b) => a - b), // Sort the numbers
        hits: combo.hits
      });
    });
  });
  
  console.log(`Found ${nearWinners.length} near winners`);
  return nearWinners;
}
