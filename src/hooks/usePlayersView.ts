
import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateSimplePdf } from '@/utils/pdf';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/contexts/game/types';

export const usePlayersView = (gameId: string | undefined) => {
  const { games } = useGame();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileData, setProfileData] = useState({
    themeColor: '#25C17E' // Default color
  });

  const game = games.find(g => g.id === gameId);
  const allDrawnNumbers = game?.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];
  const drawnNumbersSet = new Set(allDrawnNumbers);

  // Log for debugging
  useEffect(() => {
    console.log('PlayersView hook:', { 
      gameId, 
      gameFound: !!game,
      gameStatus: game?.status
    });
  }, [game, gameId]);

  // Fetch profile data for theme color
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme_color')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfileData({
            themeColor: data.theme_color || '#25C17E'
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Function to validate game data
  const validateGameData = (game: any): boolean => {
    if (!game) return false;
    if (!game.id || !game.name) return false;
    if (!Array.isArray(game.players)) return false;
    if (!Array.isArray(game.dailyDraws)) return false;
    return true;
  };
  
  // Function to generate PDF using the refactored system
  const handleGeneratePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      if (!game) {
        throw new Error('Game not found');
      }
      
      // Validate game data
      if (!validateGameData(game)) {
        throw new Error('Dados do jogo inválidos');
      }
      
      // Use the updated PDF generator
      await generateSimplePdf(game, {
        themeColor: profileData.themeColor,
        filename: `players-${game.name.replace(/\s+/g, '-')}.pdf`,
        includeNearWinners: true
      });
      
      toast({
        title: "PDF gerado com sucesso",
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

  // Get sorted players
  const sortedPlayers = game?.players ? [...game.players].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return {
    game,
    sortedPlayers,
    allDrawnNumbers,
    drawnNumbersSet,
    isGenerating,
    handleGeneratePDF,
    profileData
  };
};
