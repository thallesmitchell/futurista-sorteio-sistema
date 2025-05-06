
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DrawFormProps {
  onAddDraw: (date: string, numbersArray: number[]) => void;
  processNumberString: (numberStr: string) => number[];
}

export const DrawForm: React.FC<DrawFormProps> = ({ onAddDraw, processNumberString }) => {
  const [drawNumbers, setDrawNumbers] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const { toast } = useToast();

  // Inicializar data do sorteio com hoje ao montar o componente
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDrawDate(today);
  }, []);

  const handleDrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar data
      if (!drawDate) {
        toast({
          title: "Data inválida",
          description: "Por favor, selecione uma data para o sorteio",
          variant: "destructive"
        });
        return;
      }
      
      // Validar e converter números
      const numbersArray = processNumberString(drawNumbers);
      
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
      
      // Adicionar sorteio
      onAddDraw(drawDate, uniqueNumbers);
      
      // Limpar formulário
      setDrawNumbers('');
      
    } catch (error) {
      toast({
        title: "Erro ao registrar sorteio",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="futuristic-card">
      <CardHeader>
        <CardTitle>Registrar Sorteio Diário</CardTitle>
        <CardDescription>
          Adicione os números sorteados no dia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDrawSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="draw-date">Data do Sorteio</Label>
              <Input
                id="draw-date"
                type="date"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="draw-numbers">
                Números Sorteados <span className="text-muted-foreground">(separados por vírgula ou ponto, de 1 a 80)</span>
              </Label>
              <Input
                id="draw-numbers"
                placeholder="Ex: 7, 15, 23, 32, 41, 59"
                value={drawNumbers}
                onChange={(e) => setDrawNumbers(e.target.value)}
              />
            </div>
          </div>
          
          <Button type="submit" className="futuristic-button">
            Registrar Sorteio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
