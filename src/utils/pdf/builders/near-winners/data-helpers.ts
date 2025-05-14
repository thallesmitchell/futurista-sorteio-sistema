import { Game, Player } from '@/contexts/game/types';

interface NearWinner {
  player: Player;
  combinations: any[];
  missingHit: number;
}

// Update the function to use requiredHits instead of required_hits
export const generateNearWinnersList = (
  game: Game,
  drawnNumbers: number[]
): NearWinner[] => {
  try {
    // Create set for faster lookups
    const drawnNumbersSet = new Set(drawnNumbers);
    
    // Early returns for invalid data
    if (!game?.players || !Array.isArray(game.players)) {
      console.error('No players data available');
      return [];
    }
    
    if (!drawnNumbers || !drawnNumbers.length) {
      console.error('No drawn numbers available');
      return [];
    }
    
    // Get all players with combinations
    const playersWithCombinations = game.players.filter(
      player => player.combinations && player.combinations.length > 0
    );
    
    // Define what's "near" to winning - typically 1 number less than required
    // Use requiredHits (not required_hits) to match the Game type
    const requiredHits = game.requiredHits;
    const nearMissCriteria = requiredHits ? requiredHits - 1 : 5;
    
    // Process each player's combinations
    const nearWinners: NearWinner[] = [];
    
    for (const player of playersWithCombinations) {
      // Check each combination against drawn numbers
      for (const combo of player.combinations) {
        // Skip invalid combinations
        if (!combo.numbers || !Array.isArray(combo.numbers)) continue;
        
        // Count matches
        const hits = combo.numbers.filter(num => drawnNumbersSet.has(num)).length;
        
        // If this is a near-win, add to results
        if (hits === nearMissCriteria) {
          // Check if player is already in list
          const existingPlayer = nearWinners.find(w => w.player.id === player.id);
          
          if (existingPlayer) {
            // Add this combination to existing player entry
            existingPlayer.combinations.push(combo);
          } else {
            // Create new entry for this player
            nearWinners.push({
              player,
              combinations: [combo],
              missingHit: requiredHits - hits
            });
          }
        }
      }
    }
    
    return nearWinners;
  } catch (error) {
    console.error('Error generating near winners list:', error);
    return [];
  }
};
