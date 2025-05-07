
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Game } from '@/contexts/game/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateGameReport } from '@/utils/pdf';

interface GameReportProps {
  game: Game;
  variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const GameReport: React.FC<GameReportProps> = ({ 
  game, 
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileData, setProfileData] = React.useState({
    themeColor: '#25C17E' // Default color
  });
  
  // Fetch current admin profile
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme_color, username')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfileData({
            themeColor: data.theme_color || '#25C17E'
          });
        }
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleGenerateReport = async () => {
    // Prevent multiple clicks
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Ensure we have a complete game object with players and draws
      if (!game || !game.players || !game.dailyDraws) {
        throw new Error('Dados do jogo não estão completos');
      }
      
      console.log('Generating report for game:', game.id);
      console.log('Players count:', game.players.length);
      console.log('Draws count:', game.dailyDraws.length);
      console.log('Winners count:', game.winners?.length || 0);
      
      // Make a deep copy of the game to avoid reference issues
      const fullGame = JSON.parse(JSON.stringify(game));
      
      // Ensure each player has their name in the sequences for the PDF
      fullGame.players = fullGame.players.map(player => {
        // Make sure player name is properly set
        if (!player.name) {
          player.name = "Jogador sem nome";
        }
        return player;
      });
      
      await generateGameReport(fullGame, { themeColor: profileData.themeColor });
      
      toast({
        title: "Relatório gerado com sucesso",
        description: "O PDF foi baixado para o seu dispositivo",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: error instanceof Error ? error.message : "Ocorreu um problema ao gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleGenerateReport}
      className={className}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <FileText className="mr-1 h-4 w-4" />
          Baixar Relatório
        </>
      )}
    </Button>
  );
};
