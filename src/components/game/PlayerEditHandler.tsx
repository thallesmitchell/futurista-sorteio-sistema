
import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Player } from '@/contexts/game/types';
import { useGame } from '@/contexts/GameContext';
import { PlayerEditModal } from '@/components/game/PlayerEditModal';

interface PlayerEditHandlerProps {
  gameId: string;
  onNewWinnerFound: (hasWinners: boolean) => void;
}

export const PlayerEditHandler = forwardRef<any, PlayerEditHandlerProps>(({ gameId, onNewWinnerFound }, ref) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [editPlayerNumbers, setEditPlayerNumbers] = useState('');
  const { updatePlayerSequences, checkWinners } = useGame();
  const { toast } = useToast();

  // Expose handleEditPlayer method to parent components via ref
  useImperativeHandle(ref, () => ({
    handleEditPlayer: (player: Player) => {
      handleEditPlayer(player);
    }
  }));

  const handleEditPlayer = useCallback((player: Player) => {
    // Convert player combinations to text format for the textarea
    const playerNumbersText = player.combinations
      .map(combo => combo.numbers.map(n => String(n).padStart(2, '0')).join('-'))
      .join('\n');
    
    setPlayerToEdit(player);
    setEditPlayerNumbers(playerNumbersText);
    setIsEditModalOpen(true);
  }, []);

  const handleSavePlayerEdit = async () => {
    if (!playerToEdit) return;
    
    try {
      // Process the text with sequences to get arrays of numbers
      const sequences = editPlayerNumbers
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          // Remove spaces and convert to array of numbers, accepting multiple separators
          return line
            .split(/[\s,.-]+/)
            .filter(num => num.trim().length > 0)
            .map(num => parseInt(num, 10))
            .filter(num => !isNaN(num) && num > 0 && num <= 80);
        })
        .filter(seq => seq.length === 6); // Ensure there are 6 numbers
      
      // Update the player sequences
      if (sequences.length > 0) {
        await updatePlayerSequences(gameId, playerToEdit.id, sequences);
        
        // Immediately check if there are new winners after updating the sequences
        const currentWinners = await checkWinners(gameId);
        if (currentWinners.length > 0) {
          onNewWinnerFound(true);
        }
        
        setIsEditModalOpen(false);
        toast({
          title: "Sequências salvas",
          description: `${sequences.length} sequências foram salvas para ${playerToEdit.name}`,
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Nenhuma sequência válida encontrada. Cada linha deve ter exatamente 6 números entre 1 e 80.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao salvar sequências:", error);
      toast({
        title: "Erro ao salvar sequências",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <PlayerEditModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        player={playerToEdit}
        editPlayerNumbers={editPlayerNumbers}
        setEditPlayerNumbers={setEditPlayerNumbers}
        gameId={gameId}
        onSave={handleSavePlayerEdit}
      />
    </>
  );
});

PlayerEditHandler.displayName = "PlayerEditHandler";

export default PlayerEditHandler;
