
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Game } from '@/contexts/game/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateGameReport } from '@/utils/pdf-generator';

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
  
  const handleGenerateReport = () => {
    // Ensure we have a complete game object with players and draws
    if (!game || !game.players || !game.dailyDraws) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Dados do jogo não estão completos",
        variant: "destructive"
      });
      return;
    }
    
    // Make a deep copy of the game to avoid reference issues
    const fullGame = structuredClone(game);
    
    generateGameReport(fullGame, { themeColor: profileData.themeColor })
      .then(() => {
        toast({
          title: "Relatório gerado com sucesso",
          description: "O PDF foi baixado para o seu dispositivo",
        });
      })
      .catch(error => {
        console.error("Erro ao gerar PDF:", error);
        toast({
          title: "Erro ao gerar relatório",
          description: "Ocorreu um problema ao gerar o PDF",
          variant: "destructive"
        });
      });
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleGenerateReport}
      className={className}
    >
      <FileText className="mr-1 h-4 w-4" />
      Baixar Relatório
    </Button>
  );
};
