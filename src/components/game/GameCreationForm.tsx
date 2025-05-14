
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/game';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameCreationFormProps {
  onSuccess?: (gameId: string) => void;
  onCancel?: () => void;
}

export const GameCreationForm: React.FC<GameCreationFormProps> = ({ onSuccess, onCancel }) => {
  const { addGame } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  
  // Form state
  const [gameName, setGameName] = useState('');
  const [numbersPerSequence, setNumbersPerSequence] = useState(6);
  const [requiredHits, setRequiredHits] = useState(6);
  const [sequencePrice, setSequencePrice] = useState('10.00');
  const [adminProfitPercentage, setAdminProfitPercentage] = useState('15.00');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar autenticado para criar um jogo",
        variant: "destructive"
      });
      return;
    }
    
    if (!gameName.trim()) {
      toast({
        title: "Nome do jogo é obrigatório",
        description: "Por favor, informe um nome para o jogo",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse price and percentage values
      const priceValue = parseFloat(sequencePrice.replace(',', '.'));
      const percentageValue = parseFloat(adminProfitPercentage.replace(',', '.'));
      
      // Validate numbers
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Preço da sequência inválido");
      }
      
      if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100) {
        throw new Error("Percentual de lucro inválido");
      }
      
      const newGame = await addGame({
        name: gameName,
        start_date: new Date().toISOString(),
        status: 'active',
        owner_id: user.id,
        players: [],
        dailyDraws: [],
        winners: [],
        numbersPerSequence,
        requiredHits,
        sequencePrice: priceValue,
        adminProfitPercentage: percentageValue
      });
      
      toast({
        title: "Jogo criado com sucesso",
        description: `O jogo "${gameName}" foi criado e está pronto para uso`,
      });
      
      if (onSuccess) {
        onSuccess(newGame.id);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Erro ao criar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to format currency input
  const formatCurrency = (value: string) => {
    // Remove non-digit chars except for decimal separator
    const sanitized = value.replace(/[^\d.,]/g, '').replace(/,/g, '.');
    
    // Ensure we have at most one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return sanitized;
  };
  
  // Handle input focus on mobile to help with keyboard issues
  const handleInputFocus = () => {
    if (isMobile) {
      document.body.classList.add('keyboard-open');
    }
  };
  
  const handleInputBlur = () => {
    if (isMobile) {
      document.body.classList.remove('keyboard-open');
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className={isMobile ? "px-3 py-4" : "px-6 py-6"}>
        <CardTitle>Criar Novo Jogo</CardTitle>
        <CardDescription>Defina as regras e configurações do seu novo jogo</CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-3 pb-4" : "px-6 pb-6"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`space-y-${isMobile ? '3' : '2'}`}>
            <Label htmlFor="game-name" className={isMobile ? "mobile-form-label" : ""}>Nome do Jogo</Label>
            <Input 
              id="game-name" 
              placeholder="Digite o nome do jogo"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
              className={isMobile ? "mobile-form-input text-base" : ""}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numbers-per-sequence">
              Números por Sequência: {numbersPerSequence}
            </Label>
            <Slider 
              id="numbers-per-sequence"
              min={5}
              max={10}
              step={1}
              value={[numbersPerSequence]}
              onValueChange={([value]) => setNumbersPerSequence(value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="required-hits">
              Acertos para Vencer: {requiredHits}
            </Label>
            <Slider 
              id="required-hits"
              min={4}
              max={numbersPerSequence}
              step={1}
              value={[requiredHits]}
              onValueChange={([value]) => setRequiredHits(value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sequence-price">
              Preço por Sequência (R$)
            </Label>
            <Input
              id="sequence-price"
              placeholder="10.00"
              value={sequencePrice}
              onChange={(e) => setSequencePrice(formatCurrency(e.target.value))}
              className={isMobile ? "mobile-form-input text-base" : ""}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <p className="text-xs text-muted-foreground">Exemplo: 10.00 ou 10,00</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-profit">
              Percentual de Lucro do Admin: {adminProfitPercentage}%
            </Label>
            <Slider 
              id="admin-profit"
              min={0}
              max={50}
              step={0.5}
              value={[parseFloat(adminProfitPercentage)]}
              onValueChange={([value]) => setAdminProfitPercentage(value.toString())}
            />
            <Input
              value={adminProfitPercentage}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                  setAdminProfitPercentage(value);
                }
              }}
              className={`mt-2 ${isMobile ? "mobile-form-input text-base" : ""}`}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div className="flex gap-4 pt-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Jogo'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GameCreationForm;
