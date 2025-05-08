
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from '@/hooks/use-mobile';
import { Player, useGame } from '@/contexts/GameContext';
import { Textarea } from '@/components/ui/textarea';

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
  
  // Use context or props
  const game = gameId ? games.find(g => g.id === gameId) : null;
  const players = externalPlayers || (game ? game.players : []);
  
  // Process numbers function - Updated to treat any non-numeric character as separator
  const processNumberString = (numberStr: string) => {
    if (externalProcessNumberString) {
      return externalProcessNumberString(numberStr);
    }
    
    // Extract all numbers from the string, ignoring any non-numeric characters
    const numbersArray = numberStr.split(/[^\d]+/)
      .filter(n => n.trim() !== '')
      .map(n => parseInt(n.trim(), 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 80);
    
    return numbersArray;
  };

  const validateNumbers = (numbersString: string) => {
    // Processar os números
    const numbersArray = processNumberString(numbersString);
    
    if (numbersArray.length !== 6) {
      toast({
        title: "Quantidade inválida de números",
        description: "Você precisa selecionar exatamente 6 números (de 1 a 80)",
        variant: "destructive"
      });
      return null;
    }
    
    // Verificar duplicatas
    const uniqueNumbers = [...new Set(numbersArray)];
    if (uniqueNumbers.length !== numbersArray.length) {
      toast({
        title: "Números duplicados",
        description: "Remova os números duplicados da lista",
        variant: "destructive"
      });
      return null;
    }
    
    return numbersArray;
  };

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Always process as multi-sequence now
      const lines = playerNumbers.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        toast({
          title: "Nenhuma sequência informada",
          description: "Por favor, insira pelo menos uma sequência de números",
          variant: "destructive"
        });
        return;
      }
      
      // Validar nome para novo jogador
      if (playerName.trim() === '') {
        toast({
          title: "Nome inválido",
          description: "Por favor, insira um nome para o jogador",
          variant: "destructive"
        });
        return;
      }
      
      // Validar todas as sequências
      const validSequences: number[][] = [];
      let hasError = false;
      
      for (let i = 0; i < lines.length; i++) {
        const numbersArray = validateNumbers(lines[i]);
        if (!numbersArray) {
          hasError = true;
          toast({
            title: `Erro na sequência ${i + 1}`,
            description: `A linha "${lines[i]}" não contém 6 números válidos`,
            variant: "destructive"
          });
          break;
        }
        validSequences.push(numbersArray);
      }
      
      if (hasError) return;
      
      // Adicionar jogador com sequências
      if (externalAddPlayer && validSequences.length > 0) {
        externalAddPlayer(playerName, validSequences[0]);
        
        // Adicionar as sequências adicionais
        for (let i = 1; i < validSequences.length; i++) {
          // Assumindo que o jogador recém-criado é o último da lista
          const newPlayer = players[players.length];
          if (newPlayer && externalAddCombination) {
            externalAddCombination(newPlayer.id, validSequences[i]);
          }
        }
      } else if (gameId) {
        // Adicionar jogador com múltiplas combinações
        const combinations = validSequences.map(seq => ({ numbers: seq, hits: 0 }));
        addPlayer(gameId, {
          name: playerName,
          combinations
        });
      }
      
      // Limpar formulário
      setPlayerName('');
      setPlayerNumbers('');
      
      toast({
        title: "Jogador adicionado",
        description: `O jogador foi cadastrado com sucesso com ${validSequences.length} sequências`,
      });
    } catch (error) {
      toast({
        title: "Erro ao processar solicitação",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Nome do Jogador</Label>
              <Input
                id="player-name"
                placeholder="Ex: João Silva"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="player-numbers">
                Números Escolhidos <span className="text-muted-foreground text-xs">(6 números por linha)</span>
              </Label>
              
              <Textarea
                id="player-numbers"
                placeholder="Ex: 7 15 23 32 41 59"
                value={playerNumbers}
                onChange={(e) => setPlayerNumbers(e.target.value)}
                className="min-h-[120px]"
                inputMode={isMobile ? "numeric" : "text"}
              />
            </div>
          </div>
          
          <Button type="submit" className="futuristic-button">
            Adicionar Jogador
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
