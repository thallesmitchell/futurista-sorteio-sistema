
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { TabsController } from '@/components/game/TabsController';
import DrawsList from '@/components/game/DrawsList';
import PlayersList from '@/components/game/PlayersList';
import { WinnersModal } from '@/components/game/WinnersModal';
import { WinnerBanner } from '@/components/game/WinnerBanner';
import { ArrowLeft, Trophy } from 'lucide-react';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';
import { GameReport } from '@/components/game/GameReport';
import { useGameWinners } from '@/hooks/useGameWinners';

export default function GameHistory() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, setCurrentGame } = useGame();
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);

  const game = games.find(g => g.id === gameId);
  const allDrawnNumbers = game?.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];
  
  // Use our new hook to fetch winners directly from the database
  const { winners } = useGameWinners(gameId, game?.players);
  
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

  const hasWinners = winners.length > 0;

  const handleDeleteSuccess = () => {
    navigate('/history');
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in table-container">
        {/* Game Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{game.name}</h1>
              
              {hasWinners && (
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
                <span>{new Date(game.start_date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Encerrado em:</span>
                <span>{game.end_date ? new Date(game.end_date).toLocaleDateString() : '-'}</span>
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
            <GameReport
              game={game}
              variant="outline"
              size="default"
            />
            
            <DeleteGameButton 
              gameId={game.id}
              variant="destructive"
              size="default"
              onSuccess={handleDeleteSuccess}
            />
          </div>
        </div>

        {/* Always show the winner banner if there are winners - based on database query */}
        {hasWinners && (
          <div className="permanent-winner-banner">
            <WinnerBanner winners={winners} allDrawnNumbers={allDrawnNumbers} />
          </div>
        )}

        {/* Game Content */}
        <div className="backdrop-blur-sm bg-card/40 border border-primary/20 rounded-xl p-6">
          <TabsController>
            <TabsContent value="players">
              <PlayersList 
                players={game.players} 
                allDrawnNumbers={allDrawnNumbers} 
                onEditPlayer={() => {}} // Read-only in history view
                currentWinners={winners}
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
