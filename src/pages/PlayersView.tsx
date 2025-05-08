import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NumberBadge } from '@/components/game/NumberBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateGameReport } from '@/utils/pdf/pdfBuilder';
import { WinnerBanner } from '@/components/game/WinnerBanner';

export default function PlayersView() {
  const { gameId } = useParams<{ gameId: string }>();
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
  const winners = game?.winners || [];
  const hasWinners = winners.length > 0;
  
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

  // If game not found, show loading
  if (!game) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Function to generate PDF using the new simplified system
  const handleGeneratePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      if (!game) {
        throw new Error('Game not found');
      }
      
      // Use the simplified PDF generator
      await generateGameReport(game, {
        themeColor: profileData.themeColor,
        filename: `players-${game.name.replace(/\s+/g, '-')}.pdf`,
        includeNearWinners: true
      });
      
      toast({
        title: "PDF generated successfully",
        description: "The PDF was downloaded to your device",
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

  // Get sorted players
  const sortedPlayers = [...game.players].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto" style={{ maxWidth: '950px', width: '100%' }}>
        {/* Header */}
        <div className="py-4 px-4 md:px-0 flex items-center justify-between border-b border-border/30 mb-4">
          <div>
            <h1 className="text-2xl font-bold">{game.name}</h1>
            <p className="text-muted-foreground">
              {game.players.length} players | {game.dailyDraws.length} draws
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link to={`/admin/${game.id}`}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button 
              onClick={handleGeneratePDF} 
              variant="outline"
              size="sm"
              disabled={isGenerating}
            >
              <FileText className="mr-1 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Save as PDF'}
            </Button>
          </div>
        </div>

        {/* Mostrar banner de vencedores se houver */}
        {hasWinners && (
          <div className="px-4 md:px-0 mb-4">
            <WinnerBanner 
              winners={winners} 
              allDrawnNumbers={allDrawnNumbers}
            />
          </div>
        )}

        {/* Players List - styled similarly to PlayerList component but without edit buttons */}
        <div id="players-view-content" className="space-y-4 pb-8 px-4 md:px-0">
          <div className="columns-1 xs:columns-3 gap-3 space-y-0 w-full">
            {sortedPlayers.map((player) => (
              <div 
                key={player.id} 
                className="mb-3 inline-block w-full overflow-hidden break-inside-avoid border border-border/30 rounded-md"
              >
                <div className="p-3 border-b border-border/30 bg-muted/20">
                  <h3 className="font-semibold text-base text-center">{player.name}</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    {player.combinations.length} sequence{player.combinations.length !== 1 ? 's' : ''} | 
                    Max hits: {Math.max(...player.combinations.map(c => c.hits), 0)}
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  {player.combinations.map((combination, idx) => {
                    // Check if this is a winning combination (6 hits)
                    const isWinningCombo = combination.hits === 6;
                    
                    return (
                      <div 
                        key={`${player.id}-${idx}`} 
                        className={`flex flex-wrap gap-1 p-2 rounded-md justify-center ${
                          isWinningCombo 
                          ? 'bg-green-500/20 border border-green-500/50' 
                          : 'bg-muted/40'
                        }`}
                      >
                        {combination.numbers
                          .sort((a, b) => a - b)
                          .map((number, nIdx) => {
                            const isNumberHit = drawnNumbersSet.has(number);
                            
                            return (
                              <NumberBadge
                                key={`${player.id}-${idx}-${nIdx}`}
                                number={number}
                                size="sm"
                                isHit={isNumberHit}
                              />
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
