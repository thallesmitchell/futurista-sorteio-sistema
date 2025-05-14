
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';

export const GameNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <Flag className="h-16 w-16 mb-4 text-muted-foreground" />
      <h2 className="text-2xl font-bold mb-2">Jogo não encontrado</h2>
      <p className="text-muted-foreground mb-6">
        Não foi possível encontrar o jogo solicitado.
      </p>
      <Button onClick={() => navigate('/dashboard')}>
        Voltar para o Dashboard
      </Button>
    </div>
  );
};
