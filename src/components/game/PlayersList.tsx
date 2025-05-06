
import React from 'react';
import { Player } from '@/contexts/GameContext';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trophy } from 'lucide-react';
import { NumberBadge } from './NumberBadge';
import { WinnersTable } from './WinnersTable';

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
  return (
    <Card className="futuristic-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Jogadores Cadastrados</CardTitle>
          <CardDescription>
            {players.length} jogadores neste jogo
          </CardDescription>
        </div>
        {currentWinners.length > 0 && (
          <Alert className="w-auto bg-primary/10 border-primary text-primary px-4 py-2 m-0">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>GANHADOR ENCONTRADO!</AlertTitle>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        {currentWinners.length > 0 && (
          <WinnersTable winners={currentWinners} allDrawnNumbers={allDrawnNumbers} />
        )}
        
        {players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => {
              // Verificar acertos
              const playerHits = player.numbers.filter(n => allDrawnNumbers.includes(n));
              const isWinner = player.hits >= 6;
              
              return (
                <Card key={player.id} className={`overflow-hidden ${isWinner ? 'border border-primary' : 'border border-border/30'}`}>
                  <CardHeader className={`p-4 ${isWinner ? 'bg-primary/20' : 'bg-muted/20'}`}>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center">
                        {player.name}
                        {isWinner && <Trophy className="h-4 w-4 ml-2 text-primary" />}
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEditPlayer(player)}
                      >
                        Editar
                      </Button>
                    </div>
                    <CardDescription>
                      <span className={`font-semibold ${isWinner ? 'text-primary' : ''}`}>{player.hits || 0}</span> acertos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {player.numbers.sort((a, b) => a - b).map(number => (
                        <NumberBadge 
                          key={number} 
                          number={number} 
                          isHit={allDrawnNumbers.includes(number)} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum jogador cadastrado.</p>
            <p className="mt-2">Adicione jogadores usando o formulário acima.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
