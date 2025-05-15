
import { useState, useEffect } from 'react';
import { Player } from '@/contexts/game/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch winners for a game directly from the database
 * This provides more reliable data than relying on the in-memory cache
 */
export function useGameWinners(gameId?: string, players?: Player[]) {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchWinners() {
      if (!gameId) {
        setWinners([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        console.log("Fetching winners from database for game:", gameId);
        
        // Fetch winners directly from database for reliability
        const { data, error } = await supabase
          .from('winners')
          .select(`
            id,
            player_id,
            combination_id,
            game_id,
            prize_amount,
            created_at
          `)
          .eq('game_id', gameId);
        
        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          console.log("No winners found for game:", gameId);
          setWinners([]);
        } else {
          // Enhance winner data with player and combination information
          const enhancedWinners = data.map(winner => {
            const player = players?.find(p => p.id === winner.player_id);
            const combination = player?.combinations?.find(c => c.id === winner.combination_id);
            
            return {
              ...winner,
              player: player || { name: 'Jogador Desconhecido' },
              combination: combination || { numbers: [] }
            };
          });
          
          setWinners(enhancedWinners);
        }
      } catch (error) {
        console.error("Error fetching winners:", error);
        toast({
          title: "Erro ao carregar ganhadores",
          description: "Não foi possível carregar os dados dos ganhadores.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchWinners();
  }, [gameId, players, toast]);

  return { winners, loading };
}
