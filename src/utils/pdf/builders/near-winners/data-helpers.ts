
import { Game, Player, PlayerCombination } from '@/contexts/game/types';

interface NearWinnerItem {
  player: Player;
  combinations: PlayerCombination[];
  missingHit: number;
}

/**
 * Generate a list of near winners (players who were close to winning)
 */
export function generateNearWinnersList(game: Game, allDrawnNumbers: number[]): NearWinnerItem[] {
  try {
    if (!game.players || !Array.isArray(game.players) || game.players.length === 0) {
      console.warn('No players found in game data');
      return [];
    }
    
    const nearWinners: NearWinnerItem[] = [];
    const requiredHits = game.requiredHits || 6; // Default to 6 if not specified
    
    // For each player
    for (const player of game.players) {
      if (!player.combinations || !Array.isArray(player.combinations)) {
        continue;
      }
      
      // Check each combination for this player
      for (const combination of player.combinations) {
        if (!combination.numbers || !Array.isArray(combination.numbers)) {
          continue;
        }
        
        // Count hits - how many numbers match the drawn numbers
        const hits = combination.hits || 
          combination.numbers.filter(num => allDrawnNumbers.includes(num)).length;
        
        // If this is a near win (missing just one number)
        if (requiredHits - hits === 1) {
          // Check if this player is already in our nearWinners list
          const existingEntry = nearWinners.find(item => item.player.id === player.id);
          
          if (existingEntry) {
            // Add this combination to the existing entry
            existingEntry.combinations.push(combination);
          } else {
            // Create a new entry for this player
            nearWinners.push({
              player,
              combinations: [combination],
              missingHit: 1 // Missing just one number
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
}
