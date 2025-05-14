
import React, { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Player } from '@/contexts/game/types';
import { useGame } from '@/contexts/GameContext';

interface PlayerEditHandlerProps {
  gameId: string;
  onNewWinnerFound: (hasWinners: boolean) => void;
}

class PlayerEditHandler {
  gameId: string;
  onNewWinnerFound: (hasWinners: boolean) => void;
  toast: ReturnType<typeof useToast>['toast'];
  updatePlayerSequences: ReturnType<typeof useGame>['updatePlayerSequences'];
  checkWinners: ReturnType<typeof useGame>['checkWinners'];

  constructor({ gameId, onNewWinnerFound }: PlayerEditHandlerProps) {
    this.gameId = gameId;
    this.onNewWinnerFound = onNewWinnerFound;
    
    // These will be set later by setDependencies
    this.toast = () => {};
    this.updatePlayerSequences = async () => false;
    this.checkWinners = async () => [];
  }

  setDependencies(
    toast: ReturnType<typeof useToast>['toast'],
    updatePlayerSequences: ReturnType<typeof useGame>['updatePlayerSequences'],
    checkWinners: ReturnType<typeof useGame>['checkWinners']
  ) {
    this.toast = toast;
    this.updatePlayerSequences = updatePlayerSequences;
    this.checkWinners = checkWinners;
  }

  async handleSavePlayerEdit(playerToEdit: Player, editPlayerNumbers: string) {
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
        await this.updatePlayerSequences(this.gameId, playerToEdit.id, sequences);
        
        // Immediately check if there are new winners after updating the sequences
        const currentWinners = await this.checkWinners(this.gameId);
        if (currentWinners.length > 0) {
          this.onNewWinnerFound(true);
        }
        
        this.toast({
          title: "Sequências salvas",
          description: `${sequences.length} sequências foram salvas para ${playerToEdit.name}`,
        });
        
        return true;
      } else {
        this.toast({
          title: "Erro ao salvar",
          description: "Nenhuma sequência válida encontrada. Cada linha deve ter exatamente 6 números entre 1 e 80.",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      console.error("Erro ao salvar sequências:", error);
      this.toast({
        title: "Erro ao salvar sequências",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      
      return false;
    }
  }
}

export default PlayerEditHandler;
