
import React from 'react';
import { ConfirmCloseModal } from '@/components/game/ConfirmCloseModal';

interface GameModalsProps {
  isCloseModalOpen: boolean;
  setIsCloseModalOpen: (open: boolean) => void;
  onCloseGame: () => void;
}

export const GameModals: React.FC<GameModalsProps> = ({
  isCloseModalOpen,
  setIsCloseModalOpen,
  onCloseGame
}) => {
  return (
    <ConfirmCloseModal 
      isOpen={isCloseModalOpen}
      setIsOpen={setIsCloseModalOpen}
      onConfirm={onCloseGame}
    />
  );
};
