
import React from 'react';
import { DailyDraw } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NumberBadge } from './NumberBadge';

interface DrawsListProps {
  draws: DailyDraw[];
  isReadOnly?: boolean;
}

export const DrawsList: React.FC<DrawsListProps> = ({ 
  draws,
  isReadOnly = false
}) => {
  return (
    <Card className="futuristic-card">
      <CardHeader>
        <CardTitle>Histórico de Sorteios</CardTitle>
        <CardDescription>
          {draws.length} sorteios realizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {draws.length > 0 ? (
          <div className="space-y-4">
            {draws
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(draw => (
                <Card key={draw.id} className="overflow-hidden border border-border/30">
                  <CardHeader className="bg-muted/20 p-4">
                    <CardTitle className="text-lg">
                      Sorteio do dia {new Date(draw.date).toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {draw.numbers.sort((a, b) => a - b).map(number => (
                        <NumberBadge 
                          key={number} 
                          number={number} 
                          isHit={true} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum sorteio registrado.</p>
            <p className="mt-2">Adicione sorteios usando o formulário acima.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
