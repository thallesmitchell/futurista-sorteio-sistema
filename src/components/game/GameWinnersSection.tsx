
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
  const hasWinners = winners.length > 0;

  if (!hasWinners) return null;
  
  return (
    <>
      {/* Winner Banner */}
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
