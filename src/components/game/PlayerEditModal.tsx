
import React from 'react';
import { Player } from '@/contexts/GameContext';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PlayerEditModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  player: Player | null;
  editPlayerNumbers?: string;
  setEditPlayerNumbers?: (value: string) => void;
  onSave?: () => void;
  gameId?: string;
}

export const PlayerEditModal: React.FC<PlayerEditModalProps> = ({
  isOpen,
  setIsOpen,
  player,
  editPlayerNumbers = "",
  setEditPlayerNumbers = () => {},
  onSave = () => {}
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-panel">
        <DialogHeader>
          <DialogTitle>Editar Jogador</DialogTitle>
          <DialogDescription>
            Edite os números escolhidos pelo jogador {player?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-numbers">
              Números Escolhidos <span className="text-muted-foreground">(separados por vírgula ou ponto, de 1 a 80)</span>
            </Label>
            <Input
              id="edit-numbers"
              placeholder="Ex: 7, 15, 23, 32, 41, 59"
              value={editPlayerNumbers}
              onChange={(e) => setEditPlayerNumbers(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} className="futuristic-button">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
