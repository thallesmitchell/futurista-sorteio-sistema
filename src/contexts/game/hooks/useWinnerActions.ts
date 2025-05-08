
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
        
        // IMPORTANT: Never change game status automatically anymore
        // Only update the winners in the local state
        console.log('Updating local game state with winners');
        const updatedGames = [...games];
        updatedGames[gameIndex] = {
          ...game,
          winners: winners
        };
        
        setGames(updatedGames);
        
        // Update current game if being verified - always update winners
        if (currentGame && currentGame.id === gameId) {
          console.log('Updating current game with winners');
          setCurrentGame({
            ...currentGame,
            winners: winners
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

  return { checkWinners };
};
