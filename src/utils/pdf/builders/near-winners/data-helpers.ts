
import { Game, Player, PlayerCombination } from '@/contexts/game/types';

/**
 * Generate a list of near winners for the PDF report
 * @param game The game data
 * @param allDrawnNumbers All numbers drawn in the game
 * @returns Array of players with their near-winning combinations
 */
export function generateNearWinnersList(game: Game, allDrawnNumbers: number[]): {
  player: Player;
  combinations: PlayerCombination[];
  missingHit: number;
}[] {
  try {
    // Create a set of drawn numbers for faster lookup
    const drawnNumbersSet = new Set(allDrawnNumbers);
    
    // If there are already winners or no players or draws, return empty list
    if (
      (game.winners && game.winners.length > 0) || 
      !game.players || 
      game.players.length === 0 || 
      !game.dailyDraws || 
      game.dailyDraws.length === 0
    ) {
      return [];
    }
    
    // Get the required hits to win from game configuration
    const requiredHits = game.requiredHits || 6;
    
    // Calculate how many hits are needed to be a "near winner"
    // Usually 1 or 2 hits away from winning
    const nearWinThreshold = Math.max(requiredHits - 2, requiredHits * 0.66);
    
    // Collect near winners from all players
    const nearWinners: {
      player: Player;
      combinations: PlayerCombination[];
      missingHit: number;
    }[] = [];
    
    // Process each player
    game.players.forEach(player => {
      // Skip if no combinations
      if (!player.combinations || player.combinations.length === 0) return;
      
      // Find player's combinations that are near winners
      const nearWinningCombinations = player.combinations.filter(combo => {
        if (!combo.numbers || !Array.isArray(combo.numbers)) return false;
        
        // Count how many numbers in this combination match drawn numbers
        const hits = combo.numbers.filter(num => drawnNumbersSet.has(num)).length;
        return hits >= nearWinThreshold && hits < requiredHits;
      });
      
      // Skip if no near-winning combinations
      if (nearWinningCombinations.length === 0) return;
      
      // Add to near winners list
      nearWinners.push({
        player,
        combinations: nearWinningCombinations,
        missingHit: requiredHits - Math.max(...nearWinningCombinations.map(c => 
          c.numbers.filter(num => drawnNumbersSet.has(num)).length
        ))
      });
    });
    
    // Sort by how close they are to winning (least missing hits first)
    return nearWinners.sort((a, b) => a.missingHit - b.missingHit);
  } catch (error) {
    console.error('Error generating near winners list:', error);
    return [];
  }
}
