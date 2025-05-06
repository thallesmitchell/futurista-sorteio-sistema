
import React from 'react';
import { Player } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy } from 'lucide-react';
import { Confetti } from './Confetti';
import { WinningCombination } from './WinningCombination';

interface WinnersModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  winners: Player[];
  allDrawnNumbers: number[];
  onClose: () => void;
}

export const WinnersModal: React.FC<WinnersModalProps> = ({
  isOpen,
  setIsOpen,
  winners,
  allDrawnNumbers,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-panel max-w-md mx-auto border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]">
        {isOpen && <Confetti />}
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-center bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent flex items-center justify-center">
            <Trophy className="h-5 w-5 md:h-6 md:w-6 mr-2 text-green-500" />
            Temos um Vencedor!
          </DialogTitle>
          <DialogDescription className="text-center text-base md:text-lg">
            Parabéns aos jogadores que acertaram os 6 números!
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 md:py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3 md:space-y-4">
            {winners.map(winner => (
              // Para cada vencedor, encontrar combinações com exatamente 6 acertos
              winner.combinations
                .filter(combo => combo.hits === 6)
                .map((winningCombo, comboIndex) => (
                  <WinningCombination
                    key={`${winner.id}-${comboIndex}`}
                    winnerName={winner.name}
                    comboIndex={comboIndex}
                    numbers={winningCombo.numbers}
                    allDrawnNumbers={allDrawnNumbers}
                  />
                ))
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button 
            className="w-full futuristic-button bg-green-500 hover:bg-green-600" 
            onClick={onClose}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Encerrar Jogo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
