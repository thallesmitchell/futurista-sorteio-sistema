
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Player, useGame } from '@/contexts/GameContext';
import { usePlayerFormValidation } from '@/hooks/usePlayerFormValidation';
import { PlayerFormFields } from './PlayerFormFields';
import { useToast } from "@/hooks/use-toast";

interface PlayerFormProps {
  onAddPlayer?: (name: string, numbersArray: number[]) => void;
  onAddCombination?: (playerId: string, numbersArray: number[]) => void;
  processNumberString?: (numberStr: string) => number[];
  players?: Player[];
  gameId?: string;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ 
  onAddPlayer: externalAddPlayer,
  onAddCombination: externalAddCombination,
  processNumberString: externalProcessNumberString,
  players: externalPlayers,
  gameId
}) => {
  const [playerName, setPlayerName] = useState('');
  const [playerNumbers, setPlayerNumbers] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { addPlayer, addPlayerCombination, games } = useGame();
  const { processNumberString, validateMultipleSequences } = usePlayerFormValidation();
  
  // Use context or props
  const game = gameId ? games.find(g => g.id === gameId) : null;
  const players = externalPlayers || (game ? game.players : []);

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate player name
    if (playerName.trim() === '') {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome para o jogador",
        variant: "destructive"
      });
      return;
    }
    
    // Validate number sequences
    const validationResult = validateMultipleSequences(playerNumbers);
    if (!validationResult) return; // Error toasts are shown in validation function
    
    const validSequences = validationResult.numbers;
    
    // Add player with sequences
    if (externalAddPlayer && validSequences.length > 0) {
      externalAddPlayer(playerName, validSequences[0]);
      
      // Add additional sequences
      for (let i = 1; i < validSequences.length; i++) {
        // Assume newly created player is the last in the list
        const newPlayer = players[players.length];
        if (newPlayer && externalAddCombination) {
          externalAddCombination(newPlayer.id, validSequences[i]);
        }
      }
    } else if (gameId) {
      // Add player with multiple combinations
      const combinations = validSequences.map(seq => ({ numbers: seq, hits: 0 }));
      addPlayer(gameId, {
        name: playerName,
        combinations
      });
    }
    
    // Clear form
    setPlayerName('');
    setPlayerNumbers('');
    
    toast({
      title: "Jogador adicionado",
      description: `O jogador foi cadastrado com sucesso com ${validSequences.length} sequências`,
    });
  };

  return (
    <Card className="futuristic-card">
      <CardHeader className={isMobile ? "p-3" : "p-4"}>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Cadastrar Novo Jogador</CardTitle>
        <CardDescription>
          Adicione jogadores e seus números escolhidos
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "p-3" : "p-4"}>
        <form onSubmit={handlePlayerSubmit} className="space-y-4">
          <PlayerFormFields
            playerName={playerName}
            playerNumbers={playerNumbers}
            setPlayerName={setPlayerName}
            setPlayerNumbers={setPlayerNumbers}
          />
          
          <Button type="submit" className="futuristic-button">
            Adicionar Jogador
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
