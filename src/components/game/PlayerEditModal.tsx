
import React, { useState, useEffect } from 'react';
import { Player } from '@/contexts/GameContext';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PlayerEditModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  player: Player | null;
  gameId?: string;
  onSaveSequences: (playerId: string, sequences: number[][]) => Promise<void>;
}

export const PlayerEditModal: React.FC<PlayerEditModalProps> = ({
  isOpen,
  setIsOpen,
  player,
  gameId,
  onSaveSequences
}) => {
  const [sequences, setSequences] = useState<string>('');
  const { toast } = useToast();
  
  // Carregar sequências existentes quando o modal for aberto
  useEffect(() => {
    if (player && isOpen) {
      // Converter as combinações do jogador para o formato do textarea
      const formattedSequences = player.combinations
        .map(combo => combo.numbers.join(', '))
        .join('\n');
      setSequences(formattedSequences);
    }
  }, [player, isOpen]);

  // Processar e validar as sequências
  const validateAndParseSequences = (): number[][] | null => {
    if (!sequences.trim()) {
      toast({
        title: "Erro",
        description: "Você precisa adicionar pelo menos uma sequência de números.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const lines = sequences.split('\n').filter(line => line.trim());
      const parsedSequences: number[][] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Dividir a linha por vírgulas ou pontos e converter para números
        const numbers = line.split(/[,.\s]+/)
          .map(n => n.trim())
          .filter(n => n)
          .map(n => parseInt(n, 10));
        
        // Validar cada sequência
        if (numbers.some(n => isNaN(n) || n < 1 || n > 80)) {
          toast({
            title: "Erro na linha " + (i + 1),
            description: "Todos os números devem estar entre 1 e 80.",
            variant: "destructive"
          });
          return null;
        }
        
        // Validar que não há números repetidos
        const uniqueNumbers = new Set(numbers);
        if (uniqueNumbers.size !== numbers.length) {
          toast({
            title: "Erro na linha " + (i + 1),
            description: "Há números repetidos na sequência.",
            variant: "destructive"
          });
          return null;
        }
        
        // Adicionar à lista de sequências validadas
        parsedSequences.push(numbers);
      }
      
      return parsedSequences;
    } catch (error) {
      toast({
        title: "Erro ao processar sequências",
        description: "Verifique o formato das sequências e tente novamente.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSave = async () => {
    if (!player) return;
    
    const parsedSequences = validateAndParseSequences();
    if (!parsedSequences) return;
    
    try {
      await onSaveSequences(player.id, parsedSequences);
      setIsOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Sequências atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar sequências:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as sequências.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-panel">
        <DialogHeader>
          <DialogTitle>Editar Sequências do Jogador</DialogTitle>
          <DialogDescription>
            Edite as sequências de números escolhidas pelo jogador {player?.name}.
            Cada linha representa uma sequência, com números separados por vírgula.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-sequences">
              Sequências <span className="text-muted-foreground">(uma por linha, números separados por vírgula, de 1 a 80)</span>
            </Label>
            <Textarea
              id="edit-sequences"
              placeholder="7, 15, 23, 32, 41, 59
8, 16, 24, 33, 42, 60"
              value={sequences}
              onChange={(e) => setSequences(e.target.value)}
              rows={10}
              className="font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="futuristic-button">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
