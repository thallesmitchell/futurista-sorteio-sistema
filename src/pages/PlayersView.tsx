
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { NumberBadge } from '@/components/game/NumberBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import html2pdf from 'html2pdf.js';

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
        console.error('Erro ao buscar perfil:', err);
      }
    };
    
    fetchProfile();
  }, [user]);

  // If game not found, show loading
  if (!game) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  // Function to generate PDF directly
  const handleGeneratePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      // Get the content element
      const contentElement = document.getElementById('players-view-content');
      
      if (!contentElement) {
        throw new Error('Content element not found');
      }
      
      // Clone the content for PDF generation
      const clonedContent = contentElement.cloneNode(true) as HTMLElement;
      clonedContent.style.backgroundColor = '#020817';
      clonedContent.style.color = '#FFFFFF';
      clonedContent.style.padding = '20px';
      clonedContent.style.width = '210mm'; // A4 width
      clonedContent.style.margin = '0 auto';
      
      // Add a title to the PDF
      const titleElement = document.createElement('h1');
      titleElement.textContent = `Jogadores - ${game.name}`;
      titleElement.style.textAlign = 'center';
      titleElement.style.marginBottom = '20px';
      titleElement.style.color = '#FFFFFF';
      titleElement.style.fontSize = '24px';
      
      clonedContent.insertBefore(titleElement, clonedContent.firstChild);
      
      document.body.appendChild(clonedContent);
      
      // Generate PDF with specific options
      const pdfOptions = {
        margin: 10,
        filename: `jogadores-${game.name.replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#020817'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          background: '#020817'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      await html2pdf().from(clonedContent).set(pdfOptions).save();
      
      // Remove the cloned element
      document.body.removeChild(clonedContent);
      
      toast({
        title: "PDF gerado com sucesso",
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
              {game.players.length} jogadores | {game.dailyDraws.length} sorteios
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
                Voltar
              </Link>
            </Button>
            <Button 
              onClick={handleGeneratePDF} 
              variant="outline"
              size="sm"
              disabled={isGenerating}
            >
              <FileText className="mr-1 h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Salvar em PDF'}
            </Button>
          </div>
        </div>

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
                    {player.combinations.length} sequência{player.combinations.length !== 1 ? 's' : ''} | 
                    Acertos máximos: {Math.max(...player.combinations.map(c => c.hits), 0)}
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
                          ? 'bg-green-500/20 border border-green-500/50 animate-pulse-slow' 
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
