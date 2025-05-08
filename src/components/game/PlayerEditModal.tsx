
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Player } from '@/contexts/game/types';
import { useToast } from '@/components/ui/use-toast';
import { usePlayerActions } from '@/hooks/usePlayerActions';

export interface PlayerEditModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  player: Player | null;
  gameId: string;
  onSave: () => void;
  editPlayerNumbers: string;
  setEditPlayerNumbers: (value: string) => void;
}

export const PlayerEditModal = ({
  isOpen,
  setIsOpen,
  player,
  gameId,
  onSave,
  editPlayerNumbers,
  setEditPlayerNumbers
}: PlayerEditModalProps) => {
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState('');
  const { updatePlayerName, isLoading } = usePlayerActions();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (player) {
      setPlayerName(player.name);
    }
  }, [player]);
  
  const handleSave = async () => {
    // Verificar que todas as entradas são válidas antes de salvar
    const lines = editPlayerNumbers.split('\n').filter(line => line.trim());
    
    // Verificar se cada linha tem exatamente 6 números válidos
    const invalidLines = lines.map((line, index) => {
      // Aceitar qualquer caractere que não seja um número como separador
      const numbers = line.split(/[^\d]+/).filter(num => num.trim());
      
      // Converter para números e verificar se são válidos (> 0 e <= 80)
      const invalidNumbers = numbers
        .map(num => parseInt(num, 10))
        .filter(num => isNaN(num) || num <= 0 || num > 80);
        
      if (invalidNumbers.length > 0 || numbers.length !== 6) {
        return index + 1; // Retorna o número da linha inválida
      }
      
      return null;
    }).filter(line => line !== null);
    
    if (invalidLines.length > 0) {
      toast({
        title: "Erro ao salvar sequências",
        description: `Linhas com formato inválido: ${invalidLines.join(', ')}. Cada linha deve conter exatamente 6 números entre 1 e 80.`,
        variant: "destructive"
      });
      return;
    }
    
    // Salvar sequências
    onSave();
    
    // Atualizar o nome se foi alterado
    if (player && playerName !== player.name) {
      await updatePlayerName(gameId, player.id, playerName);
    }
    
    setIsOpen(false);
  };

  if (!player) return null;

  const content = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="playerName">Nome do Jogador</Label>
        <Input
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Nome do jogador"
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sequences">Sequências de números</Label>
        <Textarea
          id="sequences"
          placeholder="Digite as sequências de números, uma por linha"
          value={editPlayerNumbers}
          onChange={(e) => setEditPlayerNumbers(e.target.value)}
          className={cn(
            "font-mono",
            isMobile ? "h-[150px] text-base" : "h-[200px]"
          )}
          inputMode={isMobile ? "numeric" : "text"}
        />
        <p className="text-sm text-muted-foreground">
          Digite cada sequência em uma linha separada.<br/>
          Cada linha deve ter exatamente 6 números entre 1 e 80.<br/>
          Qualquer caractere que não seja número será tratado como separador.
        </p>
      </div>
    </div>
  );

  const footer = (
    <div className="mt-6 flex gap-2 w-full">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setIsOpen(false)} 
        disabled={isLoading}
        className="flex-1"
      >
        Cancelar
      </Button>
      <Button 
        type="button" 
        onClick={handleSave} 
        disabled={isLoading} 
        className="flex-1"
      >
        {isLoading ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="px-4">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle>Editar Jogador</DrawerTitle>
          </DrawerHeader>
          {content}
          {footer}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Jogador</DialogTitle>
        </DialogHeader>
        {content}
        {footer}
      </DialogContent>
    </Dialog>
  );
};

// Import cn function
import { cn } from '@/lib/utils';
