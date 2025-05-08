
import React from 'react';
import { useParams } from 'react-router-dom';
import { usePlayersView } from '@/hooks/usePlayersView';
import { PlayerViewHeader } from '@/components/game/PlayerViewHeader';
import { PlayerViewList } from '@/components/game/PlayerViewList';
import { WinnerBanner } from '@/components/game/WinnerBanner';

export default function PlayersView() {
  const { gameId } = useParams<{ gameId: string }>();
  const {
    game,
    sortedPlayers,
    allDrawnNumbers,
    drawnNumbersSet,
    winners,
    hasWinners,
    isGenerating,
    handleGeneratePDF
  } = usePlayersView(gameId);

  // If game not found, show loading
  if (!game) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

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

        {/* Mostrar banner de vencedores se houver */}
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
