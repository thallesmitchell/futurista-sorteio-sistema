
import React from 'react';
import { Player } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';
import { NumberBadge } from './NumberBadge';

interface WinnersTableProps {
  winners: Player[];
  allDrawnNumbers: number[];
}

export const WinnersTable: React.FC<WinnersTableProps> = ({ winners, allDrawnNumbers }) => {
  if (winners.length === 0) return null;
  
  return (
    <div className="mb-6">
      <Card className="border border-primary/30">
        <CardHeader className="bg-primary/10 py-3">
          <div className="flex items-center justify-center">
            <Trophy className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Ganhadores</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Acertos</TableHead>
                <TableHead>Números Acertados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map(winner => (
                <TableRow key={winner.id}>
                  <TableCell className="font-medium">{winner.name}</TableCell>
                  <TableCell>{winner.hits}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {winner.numbers
                        .filter(n => allDrawnNumbers.includes(n))
                        .map(number => (
                          <NumberBadge key={number} number={number} isHit={true} />
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
