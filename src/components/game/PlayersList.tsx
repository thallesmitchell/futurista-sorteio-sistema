
import React from 'react';
import { Player, CombinationWithHits } from '@/contexts/GameContext';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trophy } from 'lucide-react';
import { NumberBadge } from './NumberBadge';
import { WinnersTable } from './WinnersTable';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayersListProps {
  players: Player[];
  allDrawnNumbers: number[];
  currentWinners: Player[];
  onEditPlayer: (player: Player) => void;
}

export const PlayersList: React.FC<PlayersListProps> = ({ 
  players, 
  allDrawnNumbers, 
  currentWinners, 
  onEditPlayer 
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="futuristic-card">
      <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? "p-3" : "p-4"}`}>
        <div>
          <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Jogadores Cadastrados</CardTitle>
          <CardDescription>
            {players.length} jogadores neste jogo
          </CardDescription>
        </div>
        {currentWinners.length > 0 && (
          <Alert className="w-auto bg-primary/10 border-primary text-primary px-2 py-1 md:px-4 md:py-2 m-0">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>GANHADOR ENCONTRADO!</AlertTitle>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent className={isMobile ? "p-3" : "p-4"}>
        {currentWinners.length > 0 && (
          <WinnersTable winners={currentWinners} allDrawnNumbers={allDrawnNumbers} />
        )}
        
        {players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            {players.map(player => {
              // Check if any single combination has exactly 6 hits
              const hasWinningCombination = player.combinations.some(combo => combo.hits === 6);
              
              return (
                <Card key={player.id} className={`overflow-hidden ${hasWinningCombination ? 'border border-primary' : 'border border-border/30'}`}>
                  <CardHeader className={`${isMobile ? "p-2" : "p-4"} ${hasWinningCombination ? 'bg-primary/20' : 'bg-muted/20'}`}>
                    <div className="flex justify-between items-center">
                      <CardTitle className={`${isMobile ? "text-base" : "text-lg"} flex items-center`}>
                        {player.name}
                        {hasWinningCombination && <Trophy className="h-4 w-4 ml-2 text-primary" />}
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size={isMobile ? "icon" : "sm"}
                        onClick={() => onEditPlayer(player)}
                      >
                        {isMobile ? "Edit" : "Editar"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className={`${isMobile ? "p-2 max-h-60 overflow-y-auto" : "p-4"}`}>
                    {player.combinations.map((combination, index) => {
                      // Check how many hits this specific combination has
                      const hitCount = combination.hits;
                      // Check if this specific combination is a winning one (has exactly 6 hits)
                      const isWinningCombination = hitCount === 6;
                      
                      return (
                        <div 
                          key={index} 
                          className={`mb-2 ${isWinningCombination ? 'p-1 bg-primary/10 rounded-md' : ''}`}
                        >
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            <div className="w-full flex justify-between items-center mb-1">
                              <span className={`text-xs ${isWinningCombination ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                Combinação {index + 1}: {hitCount} acertos
                                {isWinningCombination && ' - VENCEDOR!'}
                              </span>
                            </div>
                            {combination.numbers.sort((a, b) => a - b).map(number => (
                              <NumberBadge 
                                key={number} 
                                number={number} 
                                isHit={allDrawnNumbers.includes(number)} 
                              />
                            ))}
                          </div>
                          {index < player.combinations.length - 1 && <hr className="my-2 border-border/30" />}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Nenhum jogador cadastrado.</p>
            <p className="mt-2">Adicione jogadores usando o formulário acima.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
