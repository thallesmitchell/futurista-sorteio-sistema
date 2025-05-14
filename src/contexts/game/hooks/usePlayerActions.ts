
import { Game, Player } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for player-related actions
 */
export const usePlayerActions = (
  games: Game[], 
  setGames: React.Dispatch<React.SetStateAction<Game[]>>,
  currentGame: Game | null,
  setCurrentGame: React.Dispatch<React.SetStateAction<Game | null>>,
  checkWinners: (gameId: string) => Promise<Player[]>
) => {
  const { toast } = useToast();

  /**
   * Add a new player to a game
   */
  const addPlayer = async (gameId: string, player: Omit<Player, 'id'>): Promise<Player | undefined> => {
    try {
      // Insert the player into Supabase
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          name: player.name,
          game_id: gameId
        })
        .select()
        .single();

      if (playerError) throw playerError;
      if (!playerData) throw new Error('Error adding player');

      const newPlayer: Player = {
        id: playerData.id,
        name: player.name,
        game_id: gameId,
        combinations: []
      };

      // If there are combinations, add them
      if (player.combinations && player.combinations.length > 0) {
        for (const combination of player.combinations) {
          // Add combination to Supabase
          const { data: comboData, error: comboError } = await supabase
            .from('player_combinations')
            .insert({
              player_id: newPlayer.id,
              numbers: combination.numbers,
              hits: combination.hits || 0
            })
            .select()
            .single();

          if (comboError) throw comboError;
          
          // Add to local list
          if (comboData) {
            newPlayer.combinations.push({
              numbers: comboData.numbers,
              hits: comboData.hits
            });
          }
        }
      }
      
      // Update the local list
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
      
      // Update current game if being edited
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          players: [...currentGame.players, newPlayer]
        });
      }
      
      return newPlayer;
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Error adding player",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  /**
   * Add a combination to a player
   */
  const addPlayerCombination = async (gameId: string, playerId: string, numbers: number[]): Promise<void> => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) throw new Error('Game not found');

      // Calculate hits based on already drawn numbers
      const drawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
      const hits = numbers.filter(n => drawnNumbers.includes(n)).length;
      
      // Add combination to Supabase
      const { data: comboData, error: comboError } = await supabase
        .from('player_combinations')
        .insert({
          player_id: playerId,
          numbers,
          hits
        })
        .select()
        .single();

      if (comboError) throw comboError;
      if (!comboData) throw new Error('Error adding combination');
      
      // Update the local list
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          const updatedPlayers = game.players.map(player => {
            if (player.id === playerId) {
              return {
                ...player,
                combinations: [
                  ...player.combinations,
                  { numbers, hits }
                ]
              };
            }
            return player;
          });
          
          // Check if there is a winner (6 hits)
          const hasWinner = updatedPlayers.some(player => 
            player.combinations.some(combo => combo.hits === 6)
          );
          
          // If there is a winner, update game status
          if (hasWinner) {
            game.status = 'closed';
            game.end_date = new Date().toISOString();
            
            // Also update the database
            supabase
              .from('games')
              .update({
                status: 'closed',
                end_date: new Date().toISOString()
              })
              .eq('id', gameId);
          }
          
          return {
            ...game,
            players: updatedPlayers
          };
        }
        return game;
      });
      
      setGames(updatedGames);
      
      // Update current game if being edited
      if (currentGame && currentGame.id === gameId) {
        const updatedPlayers = currentGame.players.map(player => {
          if (player.id === playerId) {
            return {
              ...player,
              combinations: [
                ...player.combinations,
                { numbers, hits }
              ]
            };
          }
          return player;
        });
        
        // Check if there is a winner
        const hasWinner = updatedPlayers.some(player => 
          player.combinations.some(combo => combo.hits === 6)
        );
        
        setCurrentGame({
          ...currentGame,
          players: updatedPlayers,
          status: hasWinner ? 'closed' : currentGame.status,
          end_date: hasWinner ? new Date().toISOString() : currentGame.end_date
        });
        
        // If there is a winner, check winners completely
        if (hasWinner) {
          await checkWinners(gameId);
        }
      }
    } catch (error) {
      console.error('Error adding combination:', error);
      toast({
        title: "Error adding combination",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  /**
   * Update player sequences
   */
  const updatePlayerSequences = async (gameId: string, playerId: string, sequences: number[][]): Promise<void> => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) throw new Error('Game not found');
      
      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      // 1. Remove all existing player combinations
      await supabase
        .from('player_combinations')
        .delete()
        .eq('player_id', playerId);
        
      // 2. Calculate hits for the new sequences
      const drawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
      
      // 3. Insert new combinations
      const newCombinations = [];
      
      for (const sequence of sequences) {
        const hits = sequence.filter(n => drawnNumbers.includes(n)).length;
        
        const { data, error } = await supabase
          .from('player_combinations')
          .insert({
            player_id: playerId,
            numbers: sequence,
            hits
          })
          .select()
          .single();
          
        if (error) throw error;
        if (data) {
          newCombinations.push({
            numbers: data.numbers,
            hits: data.hits
          });
        }
      }
      
      // 4. Update local state
      const updatedGames = games.map(g => {
        if (g.id === gameId) {
          return {
            ...g,
            players: g.players.map(p => {
              if (p.id === playerId) {
                return {
                  ...p,
                  combinations: newCombinations
                };
              }
              return p;
            })
          };
        }
        return g;
      });
      
      setGames(updatedGames);
      
      // Update current game if being edited
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          players: currentGame.players.map(p => {
            if (p.id === playerId) {
              return {
                ...p,
                combinations: newCombinations
              };
            }
            return p;
          })
        });
      }
    } catch (error) {
      console.error('Error updating player sequences:', error);
      toast({
        title: "Error updating sequences",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  /**
   * Update player information
   */
  const updatePlayer = async (gameId: string, playerId: string, playerUpdates: Partial<Player>): Promise<void> => {
    try {
      // Update the player in Supabase
      if (playerUpdates.name) {
        const { error } = await supabase
          .from('players')
          .update({ name: playerUpdates.name })
          .eq('id', playerId);

        if (error) throw error;
      }
      
      // Update the local list
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
      
      // Update current game if being edited
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          players: currentGame.players.map(player =>
            player.id === playerId ? { ...player, ...playerUpdates } : player
          )
        });
      }
    } catch (error) {
      console.error('Error updating player:', error);
      toast({
        title: "Error updating player",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  /**
   * Delete a player
   */
  const deletePlayer = async (playerId: string): Promise<boolean> => {
    try {
      // Find the game containing this player
      const gameWithPlayer = games.find(game => 
        game.players.some(player => player.id === playerId)
      );
      
      if (!gameWithPlayer) {
        console.error('Player not found in any game');
        return false;
      }
      
      const gameId = gameWithPlayer.id;
      
      // First delete player combinations
      const { error: combosError } = await supabase
        .from('player_combinations')
        .delete()
        .eq('player_id', playerId);
        
      if (combosError) throw combosError;
      
      // Delete winners entries if any
      const { error: winnersError } = await supabase
        .from('winners')
        .delete()
        .eq('player_id', playerId);
      
      if (winnersError) throw winnersError;
      
      // Then delete the player
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .eq('game_id', gameId);
        
      if (error) throw error;
      
      // Update local state
      const updatedGames = games.map(game => {
        if (game.id !== gameId) return game;
        
        return {
          ...game,
          players: game.players.filter(player => player.id !== playerId),
          winners: game.winners.filter(winner => winner.player_id !== playerId)
        };
      });
      
      setGames(updatedGames);
      
      // Update current game if being viewed
      if (currentGame?.id === gameId) {
        setCurrentGame({
          ...currentGame,
          players: currentGame.players.filter(player => player.id !== playerId),
          winners: currentGame.winners.filter(winner => winner.player_id !== playerId)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: "Error deleting player",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    addPlayer,
    addPlayerCombination,
    updatePlayerSequences,
    updatePlayer,
    deletePlayer
  };
};
