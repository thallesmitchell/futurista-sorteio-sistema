
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  numbers: number[][];
}

export const usePlayerFormValidation = () => {
  const { toast } = useToast();
  
  // Process numbers function - handles any non-numeric character as separator
  const processNumberString = (numberStr: string): number[] => {
    // Extract all numbers from the string, ignoring any non-numeric characters
    const numbersArray = numberStr.split(/[^\d]+/)
      .filter(n => n.trim() !== '')
      .map(n => parseInt(n.trim(), 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 80);
    
    return numbersArray;
  };

  const validateNumbers = (numbersString: string): ValidationResult | null => {
    // Process the numbers
    const numbersArray = processNumberString(numbersString);
    
    if (numbersArray.length !== 6) {
      toast({
        title: "Quantidade inválida de números",
        description: "Você precisa selecionar exatamente 6 números (de 1 a 80)",
        variant: "destructive"
      });
      return null;
    }
    
    // Check for duplicates
    const uniqueNumbers = [...new Set(numbersArray)];
    if (uniqueNumbers.length !== numbersArray.length) {
      toast({
        title: "Números duplicados",
        description: "Remova os números duplicados da lista",
        variant: "destructive"
      });
      return null;
    }
    
    return { isValid: true, numbers: [numbersArray] };
  };

  const validateMultipleSequences = (playerNumbers: string): ValidationResult | null => {
    try {
      // Process as multi-sequence
      const lines = playerNumbers.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        toast({
          title: "Nenhuma sequência informada",
          description: "Por favor, insira pelo menos uma sequência de números",
          variant: "destructive"
        });
        return null;
      }
      
      // Validate all sequences
      const validSequences: number[][] = [];
      let hasError = false;
      
      for (let i = 0; i < lines.length; i++) {
        const result = validateNumbers(lines[i]);
        if (!result) {
          hasError = true;
          toast({
            title: `Erro na sequência ${i + 1}`,
            description: `A linha "${lines[i]}" não contém 6 números válidos`,
            variant: "destructive"
          });
          break;
        }
        validSequences.push(result.numbers[0]);
      }
      
      if (hasError) return null;
      
      return { isValid: true, numbers: validSequences };
    } catch (error) {
      toast({
        title: "Erro ao processar solicitação",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    processNumberString,
    validateNumbers,
    validateMultipleSequences
  };
};
