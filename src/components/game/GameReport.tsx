
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Game } from '@/contexts/game/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateSimplePdf } from '@/utils/pdf';

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
  const [profileData, setProfileData] = useState({
    themeColor: '#39FF14' // Default color
  });
  
  // Fetch current admin profile for theme color
  useEffect(() => {
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
            themeColor: data.theme_color || '#39FF14'
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // Validate game data before generating report
  const validateGameData = (game: Game): boolean => {
    if (!game) {
      console.error('Game data is null or undefined');
      return false;
    }
    
    if (!game.id || !game.name) {
      console.error('Game is missing critical data (id or name)');
      return false;
    }
    
    if (!Array.isArray(game.players)) {
      console.error('Game players is not an array', game.players);
      return false;
    }
    
    if (!Array.isArray(game.dailyDraws)) {
      console.error('Game dailyDraws is not an array', game.dailyDraws);
      return false;
    }
    
    return true;
  };
  
  const handleGenerateReport = async () => {
    // Prevent multiple clicks
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Validate game data
      if (!validateGameData(game)) {
        throw new Error('Dados do jogo inválidos ou incompletos');
      }
      
      console.log('Generating report for game:', game.id);
      console.log('Players count:', game.players.length);
      console.log('Draws count:', game.dailyDraws.length);
      console.log('Winners count:', game.winners?.length || 0);
      
      // Generate the PDF report with safe filename
      const safeFilename = `resultado-${(game.name || 'jogo')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase()}.pdf`;
      
      // Use the updated PDF generator
      await generateSimplePdf(game, {
        themeColor: profileData.themeColor,
        filename: safeFilename,
        includeNearWinners: true
      });
      
      toast({
        title: "Relatório gerado com sucesso",
        description: "O PDF foi baixado no seu dispositivo",
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

export default GameReport;
