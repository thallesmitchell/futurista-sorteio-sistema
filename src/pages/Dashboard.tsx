
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Calendar as CalendarIcon,
  Plus,
  Users,
  ArrowRight,
  X,
  CheckCircle,
  Hourglass
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameCreationForm from '@/components/game/GameCreationForm';
import GameReport from '@/components/game/GameReport';
import { useGameWinners } from '@/hooks/useGameWinners';

const Dashboard = () => {
  const { games } = useGame();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Filter active and closed games
  const activeGames = games.filter(game => game.status === 'active');
  const closedGames = games.filter(game => game.status === 'closed');
  
  const handleCreateGameSuccess = (gameId: string) => {
    setIsCreateDialogOpen(false);
    // Redirect to the new game page
    window.location.href = `/game/${gameId}`;
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Painel de Controle</h1>
          <p className="text-muted-foreground">
            Olá, {user?.email?.split('@')[0] || 'Admin'}.
            Gerencie seus jogos e acompanhe resultados.
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Criar Novo Jogo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <GameCreationForm
              onSuccess={handleCreateGameSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active">
            <Hourglass className="mr-2 h-4 w-4" />
            Jogos Ativos ({activeGames.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            <CheckCircle className="mr-2 h-4 w-4" />
            Jogos Encerrados ({closedGames.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeGames.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">Nenhum jogo ativo encontrado</p>
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Crie um novo jogo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="closed">
          {closedGames.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">Nenhum jogo encerrado encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {closedGames.map(game => (
                <ClosedGameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const GameCard = ({ game }) => {
  // Use our hook to get real-time winners data
  const { winners } = useGameWinners(game.id, game.players);
  const hasWinners = winners && winners.length > 0;
  
  return (
    <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors">
      <div className="p-4 border-b border-primary/10 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg">{game.name}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              Iniciado em {format(new Date(game.startDate), 'P', { locale: ptBR })}
            </span>
          </div>
        </div>
        <Badge variant={hasWinners ? "destructive" : "secondary"}>
          {hasWinners ? "Tem Ganhador!" : "Ativo"}
        </Badge>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <Users className="h-4 w-4 mb-1 text-primary/70" />
          <p className="font-medium">{game.players.length}</p>
          <p className="text-xs text-muted-foreground">Jogadores</p>
        </div>
        <div>
          <CalendarIcon className="h-4 w-4 mb-1 text-primary/70" />
          <p className="font-medium">{game.dailyDraws.length}</p>
          <p className="text-xs text-muted-foreground">Sorteios</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Link to={`/game/${game.id}`}>
          <Button variant="default" className="w-full gap-2">
            <span>Gerenciar</span> 
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

const ClosedGameCard = ({ game }) => {
  // Use our hook to get winners data
  const { winners } = useGameWinners(game.id, game.players);
  
  return (
    <Card className="overflow-hidden border-muted hover:border-muted/80 transition-colors">
      <div className="p-4 border-b border-muted/10 bg-muted/5 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg opacity-80">{game.name}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              Encerrado em {format(new Date(game.endDate || game.startDate), 'P', { locale: ptBR })}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="bg-muted/20">
          <X className="h-3 w-3 mr-1" /> Encerrado
        </Badge>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <Users className="h-4 w-4 mb-1 opacity-70" />
          <p className="font-medium">{game.players.length}</p>
          <p className="text-xs text-muted-foreground">Jogadores</p>
        </div>
        <div>
          <CalendarIcon className="h-4 w-4 mb-1 opacity-70" />
          <p className="font-medium">{game.dailyDraws.length}</p>
          <p className="text-xs text-muted-foreground">Sorteios</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Link to={`/game/${game.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Visualizar
            </Button>
          </Link>
          <div className="flex-1">
            <GameReport 
              game={game} 
              variant="secondary" 
              size="sm" 
              className="w-full" 
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
