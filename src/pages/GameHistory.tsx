
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { TabsController } from '@/components/game/TabsController';
import { DrawsList } from '@/components/game/DrawsList';
import { PlayersList } from '@/components/game/PlayersList';
import { WinnersModal } from '@/components/game/WinnersModal';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';

export default function GameHistory() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, setCurrentGame } = useGame();
  const { toast } = useToast();
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);

  const game = games.find(g => g.id === gameId);
  const allDrawnNumbers = game?.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];

  // Set current game for context
  useEffect(() => {
    if (game) {
      setCurrentGame(game);
    } else {
      // If game not found, redirect to history
      navigate('/history');
    }
    
    // Cleanup on unmount
    return () => {
      setCurrentGame(null);
    };
  }, [game, gameId, navigate, setCurrentGame]);

  // Show 404 if game not found
  if (!game) {
    return <div>Game not found</div>;
  }

  const winners = game.winners || [];

  const handleGeneratePdf = async () => {
    try {
      // Create a clone of the current page content for PDF generation
      const element = document.querySelector('.pdf-container')?.cloneNode(true) as HTMLElement;
      
      if (!element) {
        toast({
          title: "Erro ao gerar PDF",
          description: "Não foi possível gerar o relatório.",
          variant: "destructive",
        });
        return;
      }
      
      // Remove any buttons or non-printable elements from the clone
      const buttons = element.querySelectorAll('button');
      buttons.forEach(button => button.remove());
      
      // Configure PDF options
      const options = {
        filename: `relatorio-${game.name}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Generate PDF
      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto o relatório é gerado...",
      });
      
      await html2pdf().from(element).set(options).save();
      
      toast({
        title: "Relatório gerado com sucesso!",
        description: "O arquivo PDF foi baixado para o seu dispositivo.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSuccess = () => {
    navigate('/history');
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Game Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{game.name}</h1>
              
              {winners.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="ml-2 bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => setIsWinnersModalOpen(true)}
                >
                  <Trophy className="mr-1 h-4 w-4" />
                  {winners.length} Ganhador{winners.length !== 1 ? 'es' : ''}
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Criado em:</span>
                <span>{new Date(game.startDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Encerrado em:</span>
                <span>{game.endDate ? new Date(game.endDate).toLocaleDateString() : '-'}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Jogadores:</span>
                <span>{game.players.length}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Sorteios:</span>
                <span>{game.dailyDraws.length}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Button 
              variant="outline" 
              onClick={handleGeneratePdf}
            >
              <Download className="mr-1 h-4 w-4" /> 
              Gerar Relatório
            </Button>
            
            <DeleteGameButton 
              gameId={game.id}
              variant="destructive"
              size="default"
              onSuccess={handleDeleteSuccess}
            />
          </div>
        </div>

        {/* Game Content */}
        <div className="pdf-container">
          <TabsController>
            <TabsContent value="players">
              <PlayersList 
                players={game.players} 
                allDrawnNumbers={allDrawnNumbers} 
                currentWinners={winners}
                onEditPlayer={() => {}} // Read-only in history view
              />
            </TabsContent>
            
            <TabsContent value="draws">
              <DrawsList 
                draws={game.dailyDraws || []} 
                isReadOnly={true}
              />
            </TabsContent>
          </TabsController>
        </div>
      </div>

      {/* Winners Modal */}
      <WinnersModal 
        isOpen={isWinnersModalOpen}
        setIsOpen={setIsWinnersModalOpen}
        winners={winners}
        allDrawnNumbers={allDrawnNumbers}
        onClose={() => setIsWinnersModalOpen(false)}
      />
    </MainLayout>
  );
}
