
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Game } from '@/contexts/game/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateGameReport } from '@/utils/pdf';
import { useGameWinners } from '@/hooks/useGameWinners';

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
  
  // IMPORTANT: Use our hook to fetch winners directly from the database
  // This ensures consistency between dashboard and game page PDF generation
  const { winners, isLoading: isLoadingWinners } = useGameWinners(game.id, game.players);
  
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
      console.log('Database Winners count:', winners?.length || 0);
      
      // Wait for winners to load if they're still loading
      if (isLoadingWinners) {
        console.log('Waiting for winners to load...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Generate the PDF report with safe filename
      const safeFilename = `resultado-${(game.name || 'jogo')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase()}.pdf`;
      
      // IMPORTANT: Create a game object that includes the winners from the database
      // Using the database winners ensures consistency between dashboard and game page
      const gameWithWinners = {
        ...game,
        winners: winners || [],
        // Add the requiredHits property for "near winners" logic
        requiredHits: game.requiredHits || 6
      };
      
      console.log('Generating PDF with winners:', gameWithWinners.winners?.length || 0);
      
      // Use the updated PDF generator with the updated game object
      await generateGameReport(gameWithWinners, {
        themeColor: profileData.themeColor,
        filename: safeFilename,
        // Only include near winners if there are no winners and game is not closed
        includeNearWinners: !(winners?.length > 0) && game.status !== 'closed',
        // Set trophy icon
        trophySvgData: `<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="m59.883 80.283h8.234v14.217h-8.234z" fill="#fbbe2c"/><path d="m57.461 62h13.078v18.283h-13.078z" fill="#fd9e27"/><path d="m36.428 10h55.144a0 0 0 0 1 0 0v35.2a27.572 27.572 0 0 1 -27.572 27.571 27.572 27.572 0 0 1 -27.572-27.571v-35.2a0 0 0 0 1 0 0z" fill="#fbbe2c"/><path d="m47.178 107.25h33.644a10.75 10.75 0 0 1 10.75 10.75 0 0 0 0 1 0 0h-55.144a0 0 0 0 1 0 0 10.75 10.75 0 0 1 10.75-10.75z" fill="#fbbe2c"/><path d="m47.172 94.5h33.656v12.75h-33.656z" fill="#deecf1"/><path d="m57.46 67.106a1.75 1.75 0 0 1 -.638-.121c-13.151-5.153-14.545-15.156-14.6-15.579a1.75 1.75 0 0 1 3.472-.443c.051.366 1.3 8.411 12.4 12.763a1.75 1.75 0 0 1 -.639 3.38z" fill="#fdd880"/><path d="m64 20.296 4.887 9.901 10.926 1.588-7.906 7.707 1.866 10.883-9.773-5.138-9.773 5.138 1.866-10.883-7.906-7.707 10.926-1.588z" fill="#deecf1"/><path d="m36.584 48.167a28.442 28.442 0 0 1 -10.517-24.984h10.355v-5.62h-12.802a2.81 2.81 0 0 0 -2.748 2.224 35.5 35.5 0 0 0 4.934 24.838 35.363 35.363 0 0 0 12.985 11.753 27.379 27.379 0 0 1 -2.207-8.211z" fill="#fbbe2c"/><g fill="#fd9e27"><path d="m91.416 48.167a28.442 28.442 0 0 0 10.516-24.984h-10.354v-5.62h12.8a2.81 2.81 0 0 1 2.748 2.224 35.5 35.5 0 0 1 -4.934 24.838 35.363 35.363 0 0 1 -12.983 11.753 27.379 27.379 0 0 0 2.207-8.211z"/><path d="m64 72.771a27.572 27.572 0 0 0 27.572-27.571v-35.2h-27.572z"/><path d="m64 80.283h4.117v14.217h-4.117z"/></g><path d="m64 94.5h16.828v12.75h-16.828z" fill="#c7e2e7"/><path d="m64 107.25v10.75h27.572a10.75 10.75 0 0 0 -10.75-10.75z" fill="#fd9e27"/><path d="m73.773 50.375-1.866-10.883 7.906-7.707-10.926-1.588-4.887-9.901v24.941z" fill="#c7e2e7"/></svg>`
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
