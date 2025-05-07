
import { Game, DailyDraw, Player } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Custom hook for draw-related actions
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
   * Add a daily draw to a game
   */
  const addDailyDraw = async (gameId: string, draw: Omit<DailyDraw, 'id'>): Promise<DailyDraw | undefined> => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) throw new Error('Game not found');

      // Insert the draw into Supabase
      const { data: drawData, error: drawError } = await supabase
        .from('daily_draws')
        .insert({
          game_id: gameId,
          date: draw.date,
          numbers: draw.numbers
        })
        .select()
        .single();

      if (drawError) throw drawError;
      if (!drawData) throw new Error('Error adding draw');

      const newDraw: DailyDraw = {
        id: drawData.id,
        date: drawData.date,
        numbers: drawData.numbers
      };
      
      // Update all game players with new hits
      const updatedGame = { ...game, dailyDraws: [...game.dailyDraws, newDraw] };
      const gameWithUpdatedHits = recalculatePlayerHits(updatedGame);
      
      // Update the hits in the database
      for (const player of gameWithUpdatedHits.players) {
        for (const combo of player.combinations) {
          await supabase
            .from('player_combinations')
            .update({ 
              hits: combo.hits 
            })
            .eq('player_id', player.id)
            .eq('numbers', combo.numbers);
        }
      }

      // Update the local list
      const updatedGames = games.map(g => {
        if (g.id === gameId) {
          return gameWithUpdatedHits;
        }
        return g;
      });
      
      setGames(updatedGames);
      
      // Update current game if being edited
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame(gameWithUpdatedHits);
      }
      
      // Check winners
      await checkWinners(gameId);
      
      return newDraw;
    } catch (error) {
      console.error('Error adding draw:', error);
      toast({
        title: "Error adding draw",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { addDailyDraw };
};
