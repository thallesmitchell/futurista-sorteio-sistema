
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayersView } from '@/hooks/usePlayersView';
import { PlayerViewHeader } from '@/components/game/PlayerViewHeader';
import { PlayerViewList } from '@/components/game/PlayerViewList';
import { WinnerBanner } from '@/components/game/WinnerBanner';
import { MobileNavBar } from '@/components/mobile/MobileNavBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameWinners } from '@/hooks/useGameWinners';

export default function PlayersView() {
  const { gameId } = useParams<{ gameId: string }>();
  const isMobile = useIsMobile();
  const {
    game,
    sortedPlayers,
    allDrawnNumbers,
    drawnNumbersSet,
    isGenerating,
    handleGeneratePDF,
    profileData
  } = usePlayersView(gameId);
  
  // Use our new hook to fetch winners directly from the database
  const { winners } = useGameWinners(gameId, game?.players);

  // If game not found, show loading
  if (!game) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const hasWinners = winners.length > 0;

  return (
    <div className="bg-background min-h-screen pb-safe-bottom">
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

        {/* Always show banner de vencedores if there are winners */}
        {hasWinners && (
          <div className={`${isMobile ? 'px-3' : 'px-4 md:px-0'} mb-4`}>
            <WinnerBanner 
              winners={winners} 
              allDrawnNumbers={allDrawnNumbers}
            />
          </div>
        )}

        {/* Players List */}
        <div id="players-view-content" className={`space-y-4 pb-8 ${isMobile ? 'px-3 pb-20' : 'px-4 md:px-0'}`}>
          <PlayerViewList
            sortedPlayers={sortedPlayers}
            drawnNumbersSet={drawnNumbersSet}
          />
        </div>
      </div>
      
      {/* Mobile Navigation Bar */}
      <MobileNavBar />
    </div>
  );
}
