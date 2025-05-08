
import React from 'react';
import { WinnerBanner } from '@/components/game/WinnerBanner';
import { WinnersModal } from '@/components/game/WinnersModal';
import { Player } from '@/contexts/game/types';

interface GameWinnersSectionProps {
  winners: Player[];
  allDrawnNumbers: number[];
  isWinnersModalOpen: boolean;
  setIsWinnersModalOpen: (open: boolean) => void;
}

export const GameWinnersSection: React.FC<GameWinnersSectionProps> = ({
  winners,
  allDrawnNumbers,
  isWinnersModalOpen,
  setIsWinnersModalOpen
}) => {
  console.log('GameWinnersSection rendered with:', {
    winnersLength: winners?.length,
  });

  // Only render if we have winners
  if (!winners || winners.length === 0) {
    return null;
  }
  
  return (
    <>
      {/* Winner Banner - show this directly from database query */}
      <div className="permanent-winner-banner">
        <WinnerBanner 
          winners={winners} 
          allDrawnNumbers={allDrawnNumbers}
        />
      </div>
      
      {/* Winners Modal */}
      <WinnersModal 
        isOpen={isWinnersModalOpen}
        setIsOpen={setIsWinnersModalOpen}
        winners={winners}
        allDrawnNumbers={allDrawnNumbers}
        onClose={() => {
          setIsWinnersModalOpen(false);
        }}
      />
    </>
  );
};
