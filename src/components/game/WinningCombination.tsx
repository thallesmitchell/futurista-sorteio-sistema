
import React from 'react';
import { NumberBadge } from './NumberBadge';
import { Trophy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WinningCombinationProps {
  winnerName: string;
  comboIndex: number;
  numbers: number[];
  allDrawnNumbers: number[];
}

export const WinningCombination: React.FC<WinningCombinationProps> = ({
  winnerName,
  comboIndex,
  numbers,
  allDrawnNumbers
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-green-500/10 p-3 rounded-lg border-2 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse-slow">
      <h3 className="text-base md:text-xl font-bold flex items-center gap-2 text-green-500">
        <Trophy className="h-5 w-5 text-green-500" />
        {winnerName}
      </h3>
      <p className="text-xs md:text-sm text-green-600 dark:text-green-400 font-medium">
        Combinação {comboIndex + 1} - 6 acertos!
      </p>
      <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
        {numbers
          .sort((a, b) => a - b)
          .map(number => (
            <NumberBadge 
              key={number} 
              number={number} 
              isHit={allDrawnNumbers.includes(number)} 
              size={isMobile ? "sm" : "md"}
            />
          ))}
      </div>
    </div>
  );
};

export default WinningCombination;
