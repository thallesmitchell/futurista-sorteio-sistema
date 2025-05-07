
import { useState } from 'react';
import { Game, Player } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
   * Check for winners in a game
   */
  const checkWinners = async (gameId: string): Promise<Player[]> => {
    try {
      const gameIndex = games.findIndex(g => g.id === gameId);
      if (gameIndex === -1) return [];
      
      // Using the game updated with recalculated hits
      const game = recalculatePlayerHits(games[gameIndex]);
      
      // A winner is a player with at least one combination that has exactly 6 hits
      const winners = game.players.filter(player => 
        player.combinations.some(combo => combo.hits === 6)
      );
      
      if (winners.length > 0 && game.status === 'active') {
        // Update game to finalized
        await supabase
          .from('games')
          .update({
            status: 'closed',
            end_date: new Date().toISOString()
          })
          .eq('id', gameId);
          
        // Register winners in Supabase
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
                await supabase
                  .from('winners')
                  .insert({
                    game_id: gameId,
                    player_id: winner.id,
                    combination_id: comboData.id
                  });
              }
            }
          }
        }
        
        // Update the local list
        const updatedGames = [...games];
        updatedGames[gameIndex] = {
          ...game,
          winners,
          status: 'closed',
          endDate: new Date().toISOString()
        };
        
        setGames(updatedGames);
        
        // Update current game if being verified
        if (currentGame && currentGame.id === gameId) {
          setCurrentGame({
            ...currentGame,
            winners,
            status: 'closed',
            endDate: new Date().toISOString()
          });
        }
        
        // Notify the user about the winner(s)
        toast({
          title: winners.length > 1 ? `${winners.length} winners found!` : "Winner found!",
          description: winners.length > 1 
            ? `Multiple players hit all 6 numbers!` 
            : `Player ${winners[0].name} hit all 6 numbers!`,
          variant: "default",
        });
      }
      
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

  return { checkWinners };
};
