
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PlayerFormProps {
  onAddPlayer: (name: string, numbersArray: number[]) => void;
  processNumberString: (numberStr: string) => number[];
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ onAddPlayer, processNumberString }) => {
  const [playerName, setPlayerName] = useState('');
  const [playerNumbers, setPlayerNumbers] = useState('');
  const { toast } = useToast();

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar nome
      if (playerName.trim() === '') {
        toast({
          title: "Nome inválido",
          description: "Por favor, insira um nome para o jogador",
          variant: "destructive"
        });
        return;
      }
      
      // Validar e converter números
      const numbersArray = processNumberString(playerNumbers);
      
      if (numbersArray.length === 0) {
        toast({
          title: "Números inválidos",
          description: "Insira números válidos separados por vírgula ou ponto",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar duplicatas
      const uniqueNumbers = [...new Set(numbersArray)];
      if (uniqueNumbers.length !== numbersArray.length) {
        toast({
          title: "Números duplicados",
          description: "Remova os números duplicados da lista",
          variant: "destructive"
        });
        return;
      }
      
      // Adicionar jogador
      onAddPlayer(playerName, uniqueNumbers);
      
      // Limpar formulário
      setPlayerName('');
      setPlayerNumbers('');
      
    } catch (error) {
      toast({
        title: "Erro ao adicionar jogador",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="futuristic-card">
      <CardHeader>
        <CardTitle>Cadastrar Novo Jogador</CardTitle>
        <CardDescription>
          Adicione jogadores e seus números escolhidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePlayerSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Números Escolhidos <span className="text-muted-foreground">(separados por vírgula ou ponto, de 1 a 80)</span>
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
            Adicionar Jogador
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
