
import React from 'react';
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
  
  // Use our hook to fetch winners directly from the database
  const { winners, isLoading: isLoadingWinners } = useGameWinners(gameId, game?.players);

  // If game not found, show loading
  if (!game) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Destructure game for better readability
  const { name, players, dailyDraws, id } = game;

  // Log to understand what's happening
  console.log('PlayersView: Rendered with winners:', {
    winnersCount: winners?.length,
    isLoadingWinners,
    gameId
  });

  return (
    <div className="bg-background min-h-screen pb-safe-bottom">
      <div className="mx-auto" style={{ maxWidth: '950px', width: '100%' }}>
        {/* Header */}
        <PlayerViewHeader 
          gameName={name}
          playersCount={players.length}
          drawsCount={dailyDraws.length}
          handleGeneratePDF={handleGeneratePDF}
          isGenerating={isGenerating}
          gameId={id}
        />

        {/* Always show banner when there are winners - based on database query */}
        {winners && winners.length > 0 && (
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
