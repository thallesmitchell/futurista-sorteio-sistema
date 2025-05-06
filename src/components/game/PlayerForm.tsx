
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from '@/hooks/use-mobile';
import { Player, useGame } from '@/contexts/GameContext';

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
  const [formMode, setFormMode] = useState('new'); // 'new' or 'existing'
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { addPlayer, addPlayerCombination, games } = useGame();
  
  // Use context or props
  const game = gameId ? games.find(g => g.id === gameId) : null;
  const players = externalPlayers || (game ? game.players : []);
  
  // Process numbers function
  const processNumberString = (numberStr: string) => {
    if (externalProcessNumberString) {
      return externalProcessNumberString(numberStr);
    }
    
    // Default implementation
    const cleanedStr = numberStr.replace(/[^\d,.\s]/g, '');
    const numbersArray = cleanedStr
      .split(/[,.\s]+/)
      .filter(n => n.trim() !== '')
      .map(n => parseInt(n.trim(), 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 80);
    
    return numbersArray;
  };

  // Reset selected player when switching to new player mode
  useEffect(() => {
    if (formMode === 'new') {
      setSelectedPlayerId('');
    } else if (players.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(players[0].id);
    }
  }, [formMode, players, selectedPlayerId]);

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
      // Validar números
      const numbersArray = validateNumbers(playerNumbers);
      if (!numbersArray) return;
      
      if (formMode === 'new') {
        // Validar nome para novos jogadores
        if (playerName.trim() === '') {
          toast({
            title: "Nome inválido",
            description: "Por favor, insira um nome para o jogador",
            variant: "destructive"
          });
          return;
        }
        
        // Adicionar novo jogador (use external or context)
        if (externalAddPlayer) {
          externalAddPlayer(playerName, numbersArray);
        } else if (gameId) {
          addPlayer(gameId, {
            name: playerName,
            combinations: [{ numbers: numbersArray, hits: 0 }]
          });
        }
        
        // Limpar formulário
        setPlayerName('');
        setPlayerNumbers('');
        
      } else {
        // Adicionar combinação a jogador existente
        if (!selectedPlayerId) {
          toast({
            title: "Jogador não selecionado",
            description: "Por favor, selecione um jogador",
            variant: "destructive"
          });
          return;
        }
        
        // Adicionar combinação (use external or context)
        if (externalAddCombination) {
          externalAddCombination(selectedPlayerId, numbersArray);
        } else if (gameId) {
          addPlayerCombination(gameId, selectedPlayerId, numbersArray);
        }
        
        // Limpar apenas os números
        setPlayerNumbers('');
      }
      
      toast({
        title: formMode === 'new' ? "Jogador adicionado" : "Combinação adicionada",
        description: formMode === 'new' 
          ? "O jogador foi cadastrado com sucesso" 
          : "A combinação foi adicionada com sucesso",
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
          <RadioGroup
            value={formMode}
            onValueChange={setFormMode}
            className="flex space-x-4 mb-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new-player" />
              <Label htmlFor="new-player">Cadastrar novo jogador</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing-player" />
              <Label htmlFor="existing-player">Escolher jogador ativo</Label>
            </div>
          </RadioGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formMode === 'new' ? (
              <div className="space-y-2">
                <Label htmlFor="player-name">Nome do Jogador</Label>
                <Input
                  id="player-name"
                  placeholder="Ex: João Silva"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="player-select">Selecionar Jogador</Label>
                <Select
                  value={selectedPlayerId}
                  onValueChange={setSelectedPlayerId}
                >
                  <SelectTrigger id="player-select">
                    <SelectValue placeholder="Selecione um jogador" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="player-numbers">
                Números Escolhidos <span className="text-muted-foreground text-xs">(6 números de 1 a 80)</span>
              </Label>
              <Input
                id="player-numbers"
                placeholder="Ex: 7, 15, 23, 32, 41, 59"
                value={playerNumbers}
                onChange={(e) => setPlayerNumbers(e.target.value)}
              />
            </div>
          </div>
          
          <Button type="submit" className="futuristic-button">
            {formMode === 'new' ? 'Adicionar Jogador' : 'Adicionar Combinação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
