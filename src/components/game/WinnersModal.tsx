
import React from 'react';
import { Player } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy } from 'lucide-react';
import { NumberBadge } from './NumberBadge';
import { useIsMobile } from '@/hooks/use-mobile';

// Componente para exibir confetes (animação de vitória)
const Confetti = () => {
  const confettiCount = 100;
  const colors = ['#ff0080', '#7b1fa2', '#00bcd4', '#ff9100', '#8bc34a'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: confettiCount }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `-5%`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${Math.random() * 3 + 2}s`,
        };
        
        return <div key={i} className="confetti" style={style} />;
      })}
    </div>
  );
};

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
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-panel max-w-md mx-auto">
        {isOpen && <Confetti />}
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center justify-center">
            <Trophy className="h-5 w-5 md:h-6 md:w-6 mr-2 text-primary" />
            Temos um Vencedor!
          </DialogTitle>
          <DialogDescription className="text-center text-base md:text-lg">
            Parabéns aos jogadores que acertaram os 6 números!
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 md:py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3 md:space-y-4">
            {winners.map(winner => (
              // For each winner, find combinations with 6 hits
              winner.combinations
                .filter(combo => combo.hits === 6)
                .map((winningCombo, comboIndex) => (
                  <div key={`${winner.id}-${comboIndex}`} className="bg-primary/10 p-3 rounded-lg">
                    <h3 className="text-base md:text-xl font-bold">{winner.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Combinação {comboIndex + 1}</p>
                    <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                      {winningCombo.numbers
                        .filter(n => allDrawnNumbers.includes(n))
                        .sort((a, b) => a - b)
                        .map(number => (
                          <NumberBadge 
                            key={number} 
                            number={number} 
                            isHit={true} 
                          />
                        ))}
                    </div>
                  </div>
                ))
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button 
            className="w-full futuristic-button" 
            onClick={onClose}
          >
            Encerrar Jogo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
