
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePlayerActions } from '@/hooks/usePlayerActions';
import { useToast } from '@/components/ui/use-toast';

interface DeletePlayerButtonProps {
  playerId: string;
  gameId: string;
  playerName: string;
  variant?: "outline" | "destructive" | "secondary" | "ghost" | "link" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const DeletePlayerButton: React.FC<DeletePlayerButtonProps> = ({
  playerId,
  gameId,
  playerName,
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const { deletePlayer, isLoading } = usePlayerActions();
  const { toast } = useToast();

  const handleConfirmDelete = async () => {
    try {
      await deletePlayer(gameId, playerId);
      setShowDialog(false);
    } catch (error) {
      console.error("Error deleting player:", error);
      toast({
        title: "Erro ao excluir jogador",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o jogador",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowDialog(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 text-destructive" />
        )}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir jogador</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir o jogador <strong>{playerName}</strong>?
              <br /><br />
              Esta ação é <strong>irreversível</strong>. Todas as sequências deste jogador serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeletePlayerButton;
