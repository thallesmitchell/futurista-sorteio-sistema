
import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Player } from '@/contexts/game/types';
import { Card } from '@/components/ui/card';
import { NumberBadge } from './NumberBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from './GameFinancialCards';

interface WinnerBannerProps {
  winners: Player[];
  allDrawnNumbers: number[];
}

interface WinningEntry {
  playerName: string;
  numbers: number[];
  prize?: number;
}

export const WinnerBanner: React.FC<WinnerBannerProps> = ({ winners, allDrawnNumbers }) => {
  const isMobile = useIsMobile();
  const [winningEntries, setWinningEntries] = useState<WinningEntry[]>([]);
  
  // Process winners whenever the winners prop changes
  useEffect(() => {
    console.log('WinnerBanner: Processing winners:', winners?.length);
    
    if (!winners || winners.length === 0) {
      console.log('WinnerBanner: No winners to process');
      setWinningEntries([]);
      return;
    }

    try {
      // Get winning combinations (with required hits, which is 6 by default)
      const requiredHits = 6; // We'll update this when we have game.requiredHits available
      
      const entries = winners.flatMap(winner => {
        if (!winner.combinations) {
          console.log(`Winner ${winner.name} has no combinations`);
          return [];
        }
        
        return winner.combinations
          .filter(combo => combo.hits >= requiredHits)
          .map(combo => ({
            playerName: winner.name,
            numbers: combo.numbers,
            prize: winner.prize
          }));
      });
      
      console.log('WinnerBanner: Found winning entries:', entries.length);
      setWinningEntries(entries);
    } catch (error) {
      console.error('Error processing winners:', error);
      setWinningEntries([]);
    }
  }, [winners]);

  // If there are no winners or entries, don't render anything
  if (!winners?.length || winningEntries.length === 0) {
    console.log('WinnerBanner: Not rendering - no winners or entries');
    return null;
  }
  
  return (
    <Card className="w-full border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] bg-green-500/10 overflow-hidden mb-4 animate-glow-green">
      <div className="p-3 md:p-4 space-y-2 md:space-y-3">
        <div className="flex items-center justify-center gap-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-6 md:w-6 text-green-500"
            viewBox="0 0 128 128"
            data-name="Layer 1"
          >
            <path d="m59.883 80.283h8.234v14.217h-8.234z" fill="#fbbe2c"/>
            <path d="m57.461 62h13.078v18.283h-13.078z" fill="#fd9e27"/>
            <path d="m36.428 10h55.144a0 0 0 0 1 0 0v35.2a27.572 27.572 0 0 1 -27.572 27.571 27.572 27.572 0 0 1 -27.572-27.571v-35.2a0 0 0 0 1 0 0z" fill="#fbbe2c"/>
            <path d="m47.178 107.25h33.644a10.75 10.75 0 0 1 10.75 10.75 0 0 0 0 1 0 0h-55.144a0 0 0 0 1 0 0 10.75 10.75 0 0 1 10.75-10.75z" fill="#fbbe2c"/>
            <path d="m47.172 94.5h33.656v12.75h-33.656z" fill="#deecf1"/>
            <path d="m57.46 67.106a1.75 1.75 0 0 1 -.638-.121c-13.151-5.153-14.545-15.156-14.6-15.579a1.75 1.75 0 0 1 3.472-.443c.051.366 1.3 8.411 12.4 12.763a1.75 1.75 0 0 1 -.639 3.38z" fill="#fdd880"/>
            <path d="m64 20.296 4.887 9.901 10.926 1.588-7.906 7.707 1.866 10.883-9.773-5.138-9.773 5.138 1.866-10.883-7.906-7.707 10.926-1.588z" fill="#deecf1"/>
            <path d="m36.584 48.167a28.442 28.442 0 0 1 -10.517-24.984h10.355v-5.62h-12.802a2.81 2.81 0 0 0 -2.748 2.224 35.5 35.5 0 0 0 4.934 24.838 35.363 35.363 0 0 0 12.985 11.753 27.379 27.379 0 0 1 -2.207-8.211z" fill="#fbbe2c"/>
            <g fill="#fd9e27">
              <path d="m91.416 48.167a28.442 28.442 0 0 0 10.516-24.984h-10.354v-5.62h12.8a2.81 2.81 0 0 1 2.748 2.224 35.5 35.5 0 0 1 -4.934 24.838 35.363 35.363 0 0 1 -12.983 11.753 27.379 27.379 0 0 0 2.207-8.211z"/>
              <path d="m64 72.771a27.572 27.572 0 0 0 27.572-27.571v-35.2h-27.572z"/>
              <path d="m64 80.283h4.117v14.217h-4.117z"/>
            </g>
            <path d="m64 94.5h16.828v12.75h-16.828z" fill="#c7e2e7"/>
            <path d="m64 107.25v10.75h27.572a10.75 10.75 0 0 0 -10.75-10.75z" fill="#fd9e27"/>
            <path d="m73.773 50.375-1.866-10.883 7.906-7.707-10.926-1.588-4.887-9.901v24.941z" fill="#c7e2e7"/>
          </svg>
          <h2 className="text-lg md:text-xl font-bold text-green-500">
            {winners.length > 1 ? 'Saiu Ganhadores!' : 'Saiu Ganhador!'}
          </h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-6 md:w-6 text-green-500"
            viewBox="0 0 128 128"
            data-name="Layer 1"
          >
            <path d="m59.883 80.283h8.234v14.217h-8.234z" fill="#fbbe2c"/>
            <path d="m57.461 62h13.078v18.283h-13.078z" fill="#fd9e27"/>
            <path d="m36.428 10h55.144a0 0 0 0 1 0 0v35.2a27.572 27.572 0 0 1 -27.572 27.571 27.572 27.572 0 0 1 -27.572-27.571v-35.2a0 0 0 0 1 0 0z" fill="#fbbe2c"/>
            <path d="m47.178 107.25h33.644a10.75 10.75 0 0 1 10.75 10.75 0 0 0 0 1 0 0h-55.144a0 0 0 0 1 0 0 10.75 10.75 0 0 1 10.75-10.75z" fill="#fbbe2c"/>
            <path d="m47.172 94.5h33.656v12.75h-33.656z" fill="#deecf1"/>
            <path d="m57.46 67.106a1.75 1.75 0 0 1 -.638-.121c-13.151-5.153-14.545-15.156-14.6-15.579a1.75 1.75 0 0 1 3.472-.443c.051.366 1.3 8.411 12.4 12.763a1.75 1.75 0 0 1 -.639 3.38z" fill="#fdd880"/>
            <path d="m64 20.296 4.887 9.901 10.926 1.588-7.906 7.707 1.866 10.883-9.773-5.138-9.773 5.138 1.866-10.883-7.906-7.707 10.926-1.588z" fill="#deecf1"/>
            <path d="m36.584 48.167a28.442 28.442 0 0 1 -10.517-24.984h10.355v-5.62h-12.802a2.81 2.81 0 0 0 -2.748 2.224 35.5 35.5 0 0 0 4.934 24.838 35.363 35.363 0 0 0 12.985 11.753 27.379 27.379 0 0 1 -2.207-8.211z" fill="#fbbe2c"/>
            <g fill="#fd9e27">
              <path d="m91.416 48.167a28.442 28.442 0 0 0 10.516-24.984h-10.354v-5.62h12.8a2.81 2.81 0 0 1 2.748 2.224 35.5 35.5 0 0 1 -4.934 24.838 35.363 35.363 0 0 1 -12.983 11.753 27.379 27.379 0 0 0 2.207-8.211z"/>
              <path d="m64 72.771a27.572 27.572 0 0 0 27.572-27.571v-35.2h-27.572z"/>
              <path d="m64 80.283h4.117v14.217h-4.117z"/>
            </g>
            <path d="m64 94.5h16.828v12.75h-16.828z" fill="#c7e2e7"/>
            <path d="m64 107.25v10.75h27.572a10.75 10.75 0 0 0 -10.75-10.75z" fill="#fd9e27"/>
            <path d="m73.773 50.375-1.866-10.883 7.906-7.707-10.926-1.588-4.887-9.901v24.941z" fill="#c7e2e7"/>
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {winningEntries.map((entry, index) => (
            <div
              key={`winner-entry-${index}`}
              className="bg-green-500/20 p-2 md:p-3 rounded-lg border border-green-500/50"
            >
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-sm md:text-base text-green-400">
                  {entry.playerName}
                </p>
                {entry.prize !== undefined && (
                  <span className="text-xs md:text-sm font-medium bg-green-600/30 text-green-300 px-2 py-0.5 rounded">
                    {formatCurrency(entry.prize)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
                {entry.numbers
                  .sort((a, b) => a - b)
                  .map((number, idx) => (
                    <NumberBadge
                      key={`${index}-${idx}`}
                      number={number}
                      size={isMobile ? "sm" : "md"}
                      isHit={true}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
