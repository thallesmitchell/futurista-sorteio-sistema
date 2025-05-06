import { Game, Player } from './types';

// Function to generate unique IDs
export const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Function to retrieve games from localStorage
export const getGamesFromStorage = (): Game[] => {
  const storedGames = localStorage.getItem('games');
  if (!storedGames) return [];
  
  const parsedGames = JSON.parse(storedGames);
  
  // Convert old player format to new format
  return parsedGames.map((game: Game) => ({
    ...game,
    players: game.players.map((player: any) => {
      // If the player already has combinations, return as is
      if (player.combinations) return player;
      
      // Otherwise, convert old format to new format
      return {
        ...player,
        combinations: [
          {
            numbers: player.numbers || [],
            hits: player.hits || 0
          }
        ]
      };
    })
  }));
};

// Function to save games to localStorage
export const saveGamesToStorage = (games: Game[]): void => {
  localStorage.setItem('games', JSON.stringify(games));
};

// Function to find a game by ID
export const findGameById = (games: Game[], id: string): Game | undefined => {
  return games.find(game => game.id === id);
};
