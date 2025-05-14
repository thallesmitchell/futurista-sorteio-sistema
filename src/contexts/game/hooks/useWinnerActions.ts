
import { useState } from 'react';
import { Game, Player, Winner } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for winner-related actions
 */
export const useWinnerActions = (
  games: Game[], 
  setGames: React.Dispatch<React.SetStateAction<Game[]>>,
  currentGame: Game | null,
  setCurrentGame: React.Dispatch<React.SetStateAction<Game | null>>,
  recalculatePlayerHits: (game: Game) => Game
) => {
  const { toast } = useToast();

  /**
   * Check for winners in a game and update database and local state
   * WITHOUT automatically changing game status
   */
  const checkWinners = async (gameId: string): Promise<Player[]> => {
    try {
      console.log('Checking for winners in game:', gameId);
      const gameIndex = games.findIndex(g => g.id === gameId);
      if (gameIndex === -1) return [];
      
      // Using the game updated with recalculated hits
      const game = recalculatePlayerHits(games[gameIndex]);
      
      // A winner is a player with at least one combination that has exactly 6 hits
      const winners = game.players.filter(player => 
        player.combinations.some(combo => combo.hits === 6)
      );
      
      console.log('Found winners:', winners.length);
      
      const winnerEntries: Winner[] = [];
      
      // Register winners in Supabase regardless of game status
      if (winners.length > 0) {
        for (const winner of winners) {
          // Find winning combinations
          const winningCombinations = winner.combinations.filter(combo => combo.hits === 6);
          
          for (const combo of winningCombinations) {
            // Find the specific combination in the database
            const { data: comboData } = await supabase
              .from('player_combinations')
              .select('id')
              .eq('player_id', winner.id)
              .eq('numbers', combo.numbers)
              .maybeSingle();
              
            if (comboData) {
              // Check if the winner is already registered
              const { data: existingWinner } = await supabase
                .from('winners')
                .select('*')
                .eq('game_id', gameId)
                .eq('player_id', winner.id)
                .eq('combination_id', comboData.id)
                .maybeSingle();
                
              // Register the winner only if not already registered
              if (!existingWinner) {
                console.log('Registering new winner in database:', winner.name);
                const { data: newWinner } = await supabase
                  .from('winners')
                  .insert({
                    game_id: gameId,
                    player_id: winner.id,
                    combination_id: comboData.id
                  })
                  .select()
                  .single();
                  
                if (newWinner) {
                  winnerEntries.push({
                    id: newWinner.id,
                    game_id: newWinner.game_id,
                    player_id: newWinner.player_id,
                    combination_id: newWinner.combination_id,
                    created_at: newWinner.created_at,
                    prize_amount: newWinner.prize_amount
                  });
                }
              } else if (existingWinner) {
                // Add existing winner to our entries
                winnerEntries.push({
                  id: existingWinner.id,
                  game_id: existingWinner.game_id,
                  player_id: existingWinner.player_id,
                  combination_id: existingWinner.combination_id,
                  created_at: existingWinner.created_at,
                  prize_amount: existingWinner.prize_amount
                });
              }
            }
          }
        }
        
        // IMPORTANT: Never change game status automatically anymore
        // Only update the winners in the local state
        console.log('Updating local game state with winners');
        const updatedGames = [...games];
        updatedGames[gameIndex] = {
          ...game,
          winners: winnerEntries
        };
        
        setGames(updatedGames);
        
        // Update current game if being verified - always update winners
        if (currentGame && currentGame.id === gameId) {
          console.log('Updating current game with winners');
          setCurrentGame({
            ...currentGame,
            winners: winnerEntries
          });
        }
        
        // Only notify if we haven't already shown this notification
        const existingGame = games[gameIndex];
        const existingWinnersCount = existingGame.winners?.length || 0;
        
        if (existingWinnersCount === 0) {
          toast({
            title: "Saiu Ganhador!",
            description: winners.length > 1 
              ? `Vários jogadores acertaram todos os 6 números!` 
              : `O jogador ${winners[0].name} acertou todos os 6 números!`,
            variant: "default",
          });
        }
      }
      
      // Always return the winners
      return winners;
    } catch (error) {
      console.error('Error checking winners:', error);
      toast({
        title: "Error checking winners",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return [];
    }
  };

  /**
   * Add a winner manually
   */
  const addWinner = async (gameId: string, playerId: string, combinationId: string): Promise<boolean> => {
    try {
      // Check if winner already exists
      const { data: existingWinner } = await supabase
        .from('winners')
        .select('*')
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .eq('combination_id', combinationId)
        .maybeSingle();
        
      if (existingWinner) {
        console.log('Winner already exists');
        return false;
      }
      
      // Add the winner
      const { data: newWinner, error } = await supabase
        .from('winners')
        .insert({
          game_id: gameId,
          player_id: playerId,
          combination_id: combinationId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (!newWinner) {
        throw new Error('Failed to add winner');
      }
      
      // Update local state
      const gameIndex = games.findIndex(g => g.id === gameId);
      if (gameIndex === -1) return false;
      
      const updatedGames = [...games];
      updatedGames[gameIndex] = {
        ...games[gameIndex],
        winners: [
          ...games[gameIndex].winners,
          {
            id: newWinner.id,
            game_id: newWinner.game_id,
            player_id: newWinner.player_id,
            combination_id: newWinner.combination_id,
            created_at: newWinner.created_at,
            prize_amount: newWinner.prize_amount
          }
        ]
      };
      
      setGames(updatedGames);
      
      // Update current game if being viewed
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          winners: [
            ...currentGame.winners,
            {
              id: newWinner.id,
              game_id: newWinner.game_id,
              player_id: newWinner.player_id,
              combination_id: newWinner.combination_id,
              created_at: newWinner.created_at,
              prize_amount: newWinner.prize_amount
            }
          ]
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding winner:', error);
      toast({
        title: "Error adding winner",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };
  
  /**
   * Get winners for a game
   */
  const getWinners = async (gameId: string): Promise<Player[]> => {
    try {
      // Find the game
      const game = games.find(g => g.id === gameId);
      if (!game) return [];
      
      // Get winners from database
      const { data: winnersData, error } = await supabase
        .from('winners')
        .select('player_id')
        .eq('game_id', gameId);
        
      if (error) throw error;
      
      if (!winnersData || winnersData.length === 0) {
        return [];
      }
      
      // Get unique player IDs
      const winnerPlayerIds = [...new Set(winnersData.map(w => w.player_id))];
      
      // Get players who are winners
      const winningPlayers = game.players.filter(player => 
        winnerPlayerIds.includes(player.id)
      );
      
      return winningPlayers;
    } catch (error) {
      console.error('Error getting winners:', error);
      toast({
        title: "Error getting winners",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return [];
    }
  };

  return { checkWinners, addWinner, getWinners };
};
