
import { ReactNode, useState } from 'react';
import { GameContext } from './GameContext';
import { Game, Player, DailyDraw } from './types';
import { generateId, getGamesFromStorage, saveGamesToStorage } from './utils';

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [games, setGames] = useState<Game[]>(getGamesFromStorage());
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const addGame = (game: Omit<Game, 'id'>) => {
    const newGame = {
      ...game,
      id: generateId(),
      players: [],
      dailyDraws: [],
      winners: []
    };
    
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    return newGame;
  };

  const updateGame = (id: string, gameUpdates: Partial<Game>) => {
    const updatedGames = games.map(game => 
      game.id === id ? { ...game, ...gameUpdates } : game
    );
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    
    // Update current game if it's being edited
    if (currentGame && currentGame.id === id) {
      setCurrentGame({ ...currentGame, ...gameUpdates });
    }
  };

  const addPlayer = (gameId: string, player: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...player,
      id: generateId(),
      combinations: player.combinations || []
    };
    
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return {
          ...game,
          players: [...game.players, newPlayer]
        };
      }
      return game;
    });
    
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    
    // Update current game if it's being edited
    if (currentGame && currentGame.id === gameId) {
      setCurrentGame({
        ...currentGame,
        players: [...currentGame.players, newPlayer]
      });
    }
    
    return newPlayer;
  };

  // Add a new combination to an existing player
  const addPlayerCombination = (gameId: string, playerId: string, numbers: number[]) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return {
          ...game,
          players: game.players.map(player => {
            if (player.id === playerId) {
              // Check hits for the new combination
              const drawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
              const hits = numbers.filter(n => drawnNumbers.includes(n)).length;
              
              // Add new combination
              return {
                ...player,
                combinations: [
                  ...player.combinations,
                  { numbers, hits }
                ]
              };
            }
            return player;
          })
        };
      }
      return game;
    });
    
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    
    // Update current game if it's being edited
    if (currentGame && currentGame.id === gameId) {
      setCurrentGame({
        ...currentGame,
        players: currentGame.players.map(player => {
          if (player.id === playerId) {
            // Check hits for the new combination
            const drawnNumbers = currentGame.dailyDraws.flatMap(draw => draw.numbers);
            const hits = numbers.filter(n => drawnNumbers.includes(n)).length;
            
            // Add new combination
            return {
              ...player,
              combinations: [
                ...player.combinations,
                { numbers, hits }
              ]
            };
          }
          return player;
        })
      });
    }
  };

  const updatePlayer = (gameId: string, playerId: string, playerUpdates: Partial<Player>) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return {
          ...game,
          players: game.players.map(player => 
            player.id === playerId ? { ...player, ...playerUpdates } : player
          )
        };
      }
      return game;
    });
    
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    
    // Update current game if it's being edited
    if (currentGame && currentGame.id === gameId) {
      setCurrentGame({
        ...currentGame,
        players: currentGame.players.map(player =>
          player.id === playerId ? { ...player, ...playerUpdates } : player
        )
      });
    }
  };

  const addDailyDraw = (gameId: string, draw: Omit<DailyDraw, 'id'>) => {
    const newDraw = {
      ...draw,
      id: generateId()
    };
    
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        // Update player hits
        const updatedPlayers = game.players.map(player => {
          // Update hits for each combination
          const updatedCombinations = player.combinations.map(combo => {
            const newHits = draw.numbers.filter(n => combo.numbers.includes(n)).length;
            return {
              ...combo,
              hits: combo.hits + newHits
            };
          });
          
          // Calculate total hits for backward compatibility
          const totalHits = updatedCombinations.reduce((sum, combo) => sum + combo.hits, 0);
          
          return {
            ...player,
            combinations: updatedCombinations,
            hits: totalHits // Maintained for backward compatibility
          };
        });
        
        return {
          ...game,
          players: updatedPlayers,
          dailyDraws: [...game.dailyDraws, newDraw]
        };
      }
      return game;
    });
    
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    
    // Update current game if it's being edited
    if (currentGame && currentGame.id === gameId) {
      const updatedPlayers = currentGame.players.map(player => {
        // Update hits for each combination
        const updatedCombinations = player.combinations.map(combo => {
          const newHits = draw.numbers.filter(n => combo.numbers.includes(n)).length;
          return {
            ...combo,
            hits: combo.hits + newHits
          };
        });
        
        // Calculate total hits for backward compatibility
        const totalHits = updatedCombinations.reduce((sum, combo) => sum + combo.hits, 0);
        
        return {
          ...player,
          combinations: updatedCombinations,
          hits: totalHits // Maintained for backward compatibility
        };
      });
      
      setCurrentGame({
        ...currentGame,
        players: updatedPlayers,
        dailyDraws: [...currentGame.dailyDraws, newDraw]
      });
    }
    
    // Check for winners after the draw
    const updatedGame = updatedGames.find(g => g.id === gameId);
    if (updatedGame) {
      checkWinners(gameId);
    }
    
    return newDraw;
  };

  const checkWinners = (gameId: string): Player[] => {
    const game = games.find(g => g.id === gameId);
    if (!game) return [];
    
    // A winner is a player with at least one combination with 6 hits
    const winners = game.players.filter(player => 
      player.combinations.some(combo => combo.hits === 6)
    );
    
    if (winners.length > 0 && game.status === 'active') {
      // Update the game with winners
      const updatedGames = games.map(g => {
        if (g.id === gameId) {
          return {
            ...g,
            winners,
            status: winners.length > 0 ? 'closed' : g.status,
            endDate: winners.length > 0 ? new Date().toISOString() : g.endDate
          };
        }
        return g;
      });
      
      setGames(updatedGames);
      saveGamesToStorage(updatedGames);
      
      // Update current game if it's being checked
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          winners,
          status: winners.length > 0 ? 'closed' : currentGame.status,
          endDate: winners.length > 0 ? new Date().toISOString() : currentGame.endDate
        });
      }
    }
    
    return winners;
  };

  return (
    <GameContext.Provider value={{
      games,
      currentGame,
      setCurrentGame,
      addGame,
      updateGame,
      addPlayer,
      addPlayerCombination,
      updatePlayer,
      addDailyDraw,
      checkWinners
    }}>
      {children}
    </GameContext.Provider>
  );
}
