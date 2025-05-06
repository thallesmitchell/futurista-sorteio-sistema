
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Player } from '@/contexts/game/types';

export interface PlayerEditModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  player: Player;
  gameId: string;
  onSave: () => void;
  // Adicionando propriedades para o textarea
  editPlayerNumbers: string;
  setEditPlayerNumbers: (value: string) => void;
}

const PlayerEditModal = ({
  isOpen,
  setIsOpen,
  player,
  gameId,
  onSave,
  editPlayerNumbers,
  setEditPlayerNumbers
}: PlayerEditModalProps) => {
  const handleSave = () => {
    onSave();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Jogador - {player.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sequences">Sequências de números</Label>
            <Textarea
              id="sequences"
              placeholder="Digite as sequências de números, uma por linha"
              value={editPlayerNumbers}
              onChange={(e) => setEditPlayerNumbers(e.target.value)}
              className="h-[200px] font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Digite cada sequência em uma linha separada. Por exemplo:
              <br />
              01-02-03-04-05-06
              <br />
              07-08-09-10-11-12
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerEditModal;
