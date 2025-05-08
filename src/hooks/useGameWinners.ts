
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/contexts/game/types';

/**
 * Custom hook to fetch game winners from the database
 * @param gameId The game ID to fetch winners for
 * @param players The game's players (needed to map winner IDs to player objects)
 * @returns An array of winner players
 */
export const useGameWinners = (gameId: string | undefined, players: Player[] | undefined) => {
  const [winners, setWinners] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId || !players || !Array.isArray(players)) {
      setWinners([]);
      return;
    }

    const fetchWinners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching winners from database for game:', gameId);
        
        // Get unique player IDs that are winners for this game
        const { data: winnersData, error } = await supabase
          .from('winners')
          .select('player_id')
          .eq('game_id', gameId);

        if (error) throw error;

        if (winnersData && winnersData.length > 0) {
          console.log('Found winners in database:', winnersData.length);
          
          // Extract unique player IDs
          const uniquePlayerIds = [...new Set(winnersData.map(w => w.player_id))];
          
          // Map winner IDs to actual player objects from the players array
          const winnerPlayers = players.filter(player => 
            uniquePlayerIds.includes(player.id)
          );
          
          console.log('Mapped winners to player data:', winnerPlayers.length);
          setWinners(winnerPlayers);
        } else {
          console.log('No winners found for game:', gameId);
          setWinners([]);
        }
      } catch (err) {
        console.error('Error fetching winners:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching winners'));
        setWinners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWinners();
  }, [gameId, players]);

  return { winners, isLoading, error };
};

export default useGameWinners;
