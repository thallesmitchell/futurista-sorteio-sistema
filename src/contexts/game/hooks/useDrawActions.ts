import { useState } from 'react';
import { Game, Player, DailyDraw } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Custom hook for daily draw operations
 */
export const useDrawActions = (
  games: Game[], 
  setGames: React.Dispatch<React.SetStateAction<Game[]>>,
  currentGame: Game | null,
  setCurrentGame: React.Dispatch<React.SetStateAction<Game | null>>,
  recalculatePlayerHits: (game: Game) => Game,
  checkWinners: (gameId: string) => Promise<Player[]>
) => {
  const { toast } = useToast();
  
  /**
   * Add a new daily draw to a game
   */
  const addDailyDraw = async (gameId: string, draw: Omit<DailyDraw, 'id'>): Promise<DailyDraw | undefined> => {
    try {
      // Insert daily draw into Supabase
      const { data, error } = await supabase
        .from('daily_draws')
        .insert({
          game_id: gameId,
          date: draw.date,
          numbers: draw.numbers
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) throw new Error('No data returned from insert');

      // Map to DailyDraw type
      const newDraw: DailyDraw = {
        id: data.id,
        date: data.date,
        numbers: data.numbers
      };
      
      // Check for winners
      console.log('Checking for winners after new draw');
      await checkWinners(gameId);

      // Update games list with new draw
      setGames(games.map(game => {
        if (game.id === gameId) {
          // Create a new list of draws with the new one
          const updatedDraws = [...(game.dailyDraws || []), newDraw];
          
          // Update the game with recalculated hits
          const updatedGame = {
            ...game,
            dailyDraws: updatedDraws
          };
          
          return recalculatePlayerHits(updatedGame);
        }
        return game;
      }));
      
      // Update current game if it's the same
      if (currentGame && currentGame.id === gameId) {
        // Create a new list of draws with the new one
        const updatedDraws = [...(currentGame.dailyDraws || []), newDraw];
        
        // Update with recalculated hits
        const updatedCurrentGame = {
          ...currentGame,
          dailyDraws: updatedDraws
        };
        
        setCurrentGame(recalculatePlayerHits(updatedCurrentGame));
      }
      
      return newDraw;
    } catch (error) {
      console.error('Error adding daily draw:', error);
      toast({
        title: "Error adding daily draw",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return undefined;
    }
  };
  
  return { addDailyDraw };
};
