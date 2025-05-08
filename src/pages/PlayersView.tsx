
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayersView } from '@/hooks/usePlayersView';
import { PlayerViewHeader } from '@/components/game/PlayerViewHeader';
import { PlayerViewList } from '@/components/game/PlayerViewList';
import { WinnerBanner } from '@/components/game/WinnerBanner';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/contexts/game/types';

export default function PlayersView() {
  const { gameId } = useParams<{ gameId: string }>();
  const [winners, setWinners] = useState<Player[]>([]);
  const {
    game,
    sortedPlayers,
    allDrawnNumbers,
    drawnNumbersSet,
    isGenerating,
    handleGeneratePDF
  } = usePlayersView(gameId);

  // Fetch winners directly from database
  useEffect(() => {
    const fetchWinners = async () => {
      if (!gameId) return;

      try {
        console.log('PlayersView: Fetching winners from database for game:', gameId);
        // Get unique player ids of winners for this game
        const { data: winnersData, error } = await supabase
          .from('winners')
          .select('player_id')
          .eq('game_id', gameId)
          .order('created_at');

        if (error) throw error;

        if (winnersData && winnersData.length > 0 && game && game.players) {
          console.log('PlayersView: Found winner entries in database:', winnersData.length);
          const uniquePlayerIds = [...new Set(winnersData.map(w => w.player_id))];
          
          // Find the actual player objects from game state
          const winnerPlayers = game.players.filter(p => 
            uniquePlayerIds.includes(p.id)
          );
          console.log('PlayersView: Matched winners with player data:', winnerPlayers.length);
          setWinners(winnerPlayers);
        } else {
          console.log('PlayersView: No winners found in database for game:', gameId);
          setWinners([]);
        }
      } catch (error) {
        console.error('PlayersView: Error fetching winners:', error);
      }
    };

    if (gameId && game) {
      fetchWinners();
    }
  }, [gameId, game]);

  // If game not found, show loading
  if (!game) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const hasWinners = winners.length > 0;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto" style={{ maxWidth: '950px', width: '100%' }}>
        {/* Header */}
        <PlayerViewHeader 
          gameName={game.name}
          playersCount={game.players.length}
          drawsCount={game.dailyDraws.length}
          handleGeneratePDF={handleGeneratePDF}
          isGenerating={isGenerating}
          gameId={game.id}
        />

        {/* Always show banner de vencedores if there are winners - based on database query */}
        {hasWinners && (
          <div className="px-4 md:px-0 mb-4">
            <WinnerBanner 
              winners={winners} 
              allDrawnNumbers={allDrawnNumbers}
            />
          </div>
        )}

        {/* Players List */}
        <div id="players-view-content" className="space-y-4 pb-8 px-4 md:px-0">
          <PlayerViewList
            sortedPlayers={sortedPlayers}
            drawnNumbersSet={drawnNumbersSet}
          />
        </div>
      </div>
    </div>
  );
}
