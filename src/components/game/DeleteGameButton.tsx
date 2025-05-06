
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/use-toast';

interface DeleteGameButtonProps {
  gameId: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onSuccess?: () => void;
}

export const DeleteGameButton: React.FC<DeleteGameButtonProps> = ({
  gameId,
  variant = "destructive",
  size = "icon",
  className = "",
  onSuccess
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { deleteGame } = useGame();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteGame(gameId);
    setIsConfirmOpen(false);
    
    toast({
      title: "Jogo excluído",
      description: "O jogo foi removido com sucesso",
    });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsConfirmOpen(true)}
        title="Excluir Jogo"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
