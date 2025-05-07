
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Game } from '@/contexts/game/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateGameReport } from '@/utils/pdf/pdfBuilder';

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
  
  // Fetch current admin profile
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
  
  const handleGenerateReport = async () => {
    // Prevent multiple clicks
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Ensure we have a complete game object with players and draws
      if (!game || !game.players || !game.dailyDraws) {
        throw new Error('Game data is incomplete');
      }
      
      console.log('Generating report for game:', game.id);
      console.log('Players count:', game.players.length);
      console.log('Draws count:', game.dailyDraws.length);
      console.log('Winners count:', game.winners?.length || 0);
      
      // Generate PDF using our system with all required parameters
      await generateGameReport(game, {
        themeColor: profileData.themeColor,
        filename: `resultado-${game.name.replace(/\s+/g, '-')}.pdf`,
        includeNearWinners: true
      });
      
      toast({
        title: "Report generated successfully",
        description: "The PDF has been downloaded to your device",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating report",
        description: error instanceof Error ? error.message : "A problem occurred while generating the PDF",
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
          Generating...
        </>
      ) : (
        <>
          <FileText className="mr-1 h-4 w-4" />
          Download Report
        </>
      )}
    </Button>
  );
};

export default GameReport;
