
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerFormFieldsProps {
  playerName: string;
  playerNumbers: string;
  setPlayerName: (name: string) => void;
  setPlayerNumbers: (numbers: string) => void;
}

export const PlayerFormFields: React.FC<PlayerFormFieldsProps> = ({
  playerName,
  playerNumbers,
  setPlayerName,
  setPlayerNumbers
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <div className="space-y-2.5">
        <Label htmlFor="player-name" className="text-sm md:text-base">
          Nome do Jogador
        </Label>
        <Input
          id="player-name"
          placeholder="Ex: João Silva"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="mb-0"
          // Garantindo que não temos inputMode definido para evitar teclado numérico
          autoComplete="name"
        />
      </div>
      
      <div className="space-y-2.5">
        <Label htmlFor="player-numbers" className="text-sm md:text-base">
          Números Escolhidos{" "}
          <span className="text-muted-foreground text-xs">
            (6 números por linha)
          </span>
        </Label>
        
        <Textarea
          id="player-numbers"
          placeholder="Ex: 7 15 23 32 41 59"
          value={playerNumbers}
          onChange={(e) => setPlayerNumbers(e.target.value)}
          className="min-h-[120px] resize-y mb-0"
          // Evite inputMode="numeric" para permitir teclado completo
        />
      </div>
    </div>
  );
};
