
import React from 'react';
import { Player } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';
import { NumberBadge } from './NumberBadge';
import { useIsMobile } from '@/hooks/use-mobile';

interface WinnersTableProps {
  winners: Player[];
  allDrawnNumbers: number[];
}

export const WinnersTable: React.FC<WinnersTableProps> = ({ winners, allDrawnNumbers }) => {
  const isMobile = useIsMobile();
  
  if (winners.length === 0) return null;
  
  return (
    <div className="mb-4 md:mb-6">
      <Card className="border border-primary/30">
        <CardHeader className={`bg-primary/10 ${isMobile ? "py-2" : "py-3"}`}>
          <div className="flex items-center justify-center">
            <Trophy className={`${isMobile ? "h-4 w-4 mr-1" : "h-5 w-5 mr-2"} text-primary`} />
            <CardTitle className={`${isMobile ? "text-base" : "text-lg"}`}>Ganhadores</CardTitle>
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? "p-2" : "p-4"}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isMobile ? "text-xs" : ""}>Nome</TableHead>
                <TableHead className={isMobile ? "text-xs" : ""}>Combinação</TableHead>
                <TableHead className={isMobile ? "text-xs" : ""}>Números Acertados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map(winner => (
                // Find combinations with 6 hits
                winner.combinations
                  .filter(combo => combo.hits === 6)
                  .map((winningCombo, comboIndex) => (
                    <TableRow key={`${winner.id}-${comboIndex}`}>
                      <TableCell className={`${isMobile ? "text-xs" : ""} font-medium`}>{winner.name}</TableCell>
                      <TableCell className={isMobile ? "text-xs" : ""}>
                        Combinação {comboIndex + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {winningCombo.numbers
                            .filter(n => allDrawnNumbers.includes(n))
                            .map(number => (
                              <NumberBadge key={number} number={number} isHit={true} />
                            ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
