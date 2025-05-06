import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsController } from '@/components/game/TabsController';
import { PlayerForm } from '@/components/game/PlayerForm';
import { DrawForm } from '@/components/game/DrawForm';
import { DrawsList } from '@/components/game/DrawsList';
import { PlayersList } from '@/components/game/PlayersList';
import { PlayerEditModal } from '@/components/game/PlayerEditModal';
import { WinnersModal } from '@/components/game/WinnersModal';
import { ConfirmCloseModal } from '@/components/game/ConfirmCloseModal';
import { ArrowLeft, Trophy, Users, CalendarDays, UserPlus } from 'lucide-react';
import { Player } from '@/contexts/GameContext';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';
import { GameReport } from '@/components/game/GameReport';

export default function GameAdmin() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, setCurrentGame, updateGame } = useGame();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [editPlayerNumbers, setEditPlayerNumbers] = useState('');

  const game = games.find(g => g.id === gameId);
  const allDrawnNumbers = game?.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];

  // Set current game for context
  useEffect(() => {
    if (game) {
      if (game.status === 'closed') {
        // Redirect to history view if game is closed
        navigate(`/history/${game.id}`);
        return;
      }
      setCurrentGame(game);
    } else {
      // If game not found, redirect to dashboard
      navigate('/dashboard');
    }
    
    // Cleanup on unmount
    return () => {
      setCurrentGame(null);
    };
  }, [game, gameId, navigate, setCurrentGame]);

  // Show 404 if game not found
  if (!game || game.status === 'closed') {
    return null; // Will redirect in useEffect
  }

  const handleEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    setIsEditModalOpen(true);
  };

  const handleCloseGame = () => {
    updateGame(game.id, {
      status: 'closed',
      endDate: new Date().toISOString()
    });
    setIsCloseModalOpen(false);
    // Redirect to history view
    navigate(`/history/${game.id}`);
  };

  const winners = game.winners || [];
  
  // Handle save player edit
  const handleSavePlayerEdit = () => {
    // Implementation will be added when needed
    console.log("Save player edit functionality to be implemented");
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Game Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
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
              variant="outline"
              size="default"
              onSuccess={() => navigate('/dashboard')}
            />
            
            <Button 
              variant="destructive" 
              onClick={() => setIsCloseModalOpen(true)}
              disabled={winners.length > 0}
            >
              {winners.length > 0 ? 'Jogo Encerrado' : 'Encerrar Jogo'}
            </Button>
          </div>
        </div>

        {/* Game Forms - Now as tabs */}
        <Card className="p-5 backdrop-blur-sm bg-card/40 border-primary/20">
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="players" className="data-[state=active]:bg-primary/20">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Novo Jogador
              </TabsTrigger>
              <TabsTrigger value="draws" className="data-[state=active]:bg-primary/20">
                <CalendarDays className="mr-2 h-4 w-4" />
                Registrar Sorteio Diário
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="players">
              <PlayerForm gameId={game.id} />
            </TabsContent>
            
            <TabsContent value="draws">
              <DrawForm gameId={game.id} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Game Content */}
        <TabsController defaultValue="players">
          <TabsContent value="players">
            <PlayersList 
              players={game.players} 
              allDrawnNumbers={allDrawnNumbers}
              onEditPlayer={handleEditPlayer}
              currentWinners={winners}
            />
          </TabsContent>
          
          <TabsContent value="draws">
            <DrawsList 
              draws={game.dailyDraws || []}
              isReadOnly={false}
            />
          </TabsContent>
        </TabsController>
      </div>

      {/* Edit Player Modal */}
      <PlayerEditModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        player={playerToEdit}
        editPlayerNumbers={editPlayerNumbers}
        setEditPlayerNumbers={setEditPlayerNumbers}
        gameId={game.id}
        onSave={handleSavePlayerEdit}
      />

      {/* Winners Modal */}
      <WinnersModal 
        isOpen={isWinnersModalOpen}
        setIsOpen={setIsWinnersModalOpen}
        winners={winners}
        allDrawnNumbers={allDrawnNumbers}
        onClose={() => setIsWinnersModalOpen(false)}
      />

      {/* Confirm Close Modal */}
      <ConfirmCloseModal 
        isOpen={isCloseModalOpen}
        setIsOpen={setIsCloseModalOpen}
        onConfirm={handleCloseGame}
      />
    </MainLayout>
  );
}
