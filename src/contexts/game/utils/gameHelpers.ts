
import { Game, Player } from '../types';

/**
 * Recalculate hits for all player combinations based on all drawn numbers
 */
export const recalculatePlayerHits = (game: Game): Game => {
  if (!game.dailyDraws || game.dailyDraws.length === 0) return game;
  
  const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
  
  const updatedPlayers = game.players.map(player => {
    const updatedCombinations = player.combinations.map(combo => {
      const hits = combo.numbers.filter(num => allDrawnNumbers.includes(num)).length;
      return { ...combo, hits };
    });
    
    return {
      ...player,
      combinations: updatedCombinations
    };
  });
  
  return {
    ...game,
    players: updatedPlayers
  };
};

/**
 * Find players that have winning combinations (6 hits)
 */
export const findWinningPlayers = (game: Game): Player[] => {
  return game.players.filter(player => 
    player.combinations.some(combo => combo.hits === 6)
  );
};
