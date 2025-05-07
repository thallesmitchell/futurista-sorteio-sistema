
import { useState } from 'react';
import { useGame } from '@/contexts/game/GameContext';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/contexts/game/types';

export const usePlayerActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { games, setGames } = useGame();
  const { toast } = useToast();

  const updatePlayerName = async (gameId: string, playerId: string, name: string) => {
    setIsLoading(true);
    
    try {
      // Update player in the database
      const { error } = await supabase
        .from('players')
        .update({ name })
        .eq('id', playerId)
        .eq('game_id', gameId);
        
      if (error) throw error;
      
      // Update player in local state
      setGames(prevGames => 
        prevGames.map(game => {
          if (game.id !== gameId) return game;
          
          const updatedPlayers = game.players.map(player => {
            if (player.id !== playerId) return player;
            return { ...player, name };
          });
          
          return { ...game, players: updatedPlayers };
        })
      );
      
      toast({
        title: "Nome atualizado",
        description: "O nome do jogador foi atualizado com sucesso.",
      });
      
    } catch (error) {
      console.error('Error updating player name:', error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o nome do jogador",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlayer = async (gameId: string, playerId: string) => {
    setIsLoading(true);
    
    try {
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
      setGames(prevGames => 
        prevGames.map(game => {
          if (game.id !== gameId) return game;
          
          // Remove player from the list
          const updatedPlayers = game.players.filter(player => player.id !== playerId);
          
          // Update winners list if needed
          const updatedWinners = game.winners ? 
            game.winners.filter(winner => winner.id !== playerId) : 
            [];
          
          return { 
            ...game, 
            players: updatedPlayers,
            winners: updatedWinners.length > 0 ? updatedWinners : undefined
          };
        })
      );
      
      toast({
        title: "Jogador excluído",
        description: "O jogador foi excluído com sucesso.",
      });
      
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o jogador",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    updatePlayerName,
    deletePlayer
  };
};
