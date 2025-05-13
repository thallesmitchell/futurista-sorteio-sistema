
import React from 'react';
import { ConfirmCloseModal } from '@/components/game/ConfirmCloseModal';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleCloseGame = () => {
    onCloseGame();
    // Redirect to dashboard after closing the game
    navigate('/dashboard');
  };

  return (
    <ConfirmCloseModal 
      isOpen={isCloseModalOpen}
      setIsOpen={setIsCloseModalOpen}
      onConfirm={handleCloseGame}
    />
  );
};
