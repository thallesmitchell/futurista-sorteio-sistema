
import { Game, Player, PlayerCombination } from "@/contexts/game/types";

// Define the near winner type
export interface NearWinner {
  playerName: string;
  numbers: number[];
  hits: number;
}

/**
 * Get data for players with near-winning combinations (5 hits)
 */
export const getNearWinnersData = (game: Game): NearWinner[] => {
  // Check if game has the necessary data
  if (!game.players || !game.dailyDraws) {
    return [];
  }

  // Get the latest draw numbers
  const latestDraw = [...game.dailyDraws].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  if (!latestDraw || !latestDraw.numbers) {
    return [];
  }

  const drawnNumbers = latestDraw.numbers;
  const requireOneMoreHit = (game.required_hits || 6) - 1; // Usually 5 for a 6-number game

  // Find players with combinations that have 5 hits
  const nearWinners: NearWinner[] = [];

  game.players.forEach((player: Player) => {
    if (!player.combinations) return;

    player.combinations.forEach((combination: PlayerCombination) => {
      const hits = combination.numbers.filter(num => drawnNumbers.includes(num)).length;

      if (hits === requireOneMoreHit) {
        nearWinners.push({
          playerName: player.name,
          numbers: combination.numbers,
          hits: hits
        });
      }
    });
  });

  return nearWinners;
};

/**
 * Group near winners by player
 */
export const groupNearWinnersByPlayer = (nearWinners: NearWinner[]): Record<string, NearWinner[]> => {
  const grouped: Record<string, NearWinner[]> = {};
  
  nearWinners.forEach(nw => {
    if (!grouped[nw.playerName]) {
      grouped[nw.playerName] = [];
    }
    grouped[nw.playerName].push(nw);
  });
  
  return grouped;
};

/**
 * Find winning numbers in a combination
 */
export const findMatchingNumbers = (combination: number[], drawnNumbers: number[]): number[] => {
  return combination.filter(num => drawnNumbers.includes(num));
};

/**
 * Calculate total near winners
 */
export const countTotalNearWinners = (game: Game): number => {
  return getNearWinnersData(game).length;
};
