
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useGame } from '@/contexts/GameContext';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, Search } from 'lucide-react';
import { DeleteGameButton } from '@/components/game/DeleteGameButton';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { games } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const isMobile = useIsMobile();
  
  // Filtrar jogos
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Histórico de Jogos</h1>
        </div>

        <Card className="futuristic-card">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre os jogos por nome ou status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os jogos</SelectItem>
                  <SelectItem value="active">Jogos ativos</SelectItem>
                  <SelectItem value="closed">Jogos encerrados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="futuristic-card">
          <CardHeader>
            <CardTitle>Jogos</CardTitle>
            <CardDescription>
              {filteredGames.length} jogos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredGames.length > 0 ? (
              isMobile ? (
                // Card-based layout for mobile
                <div className="space-y-4">
                  {filteredGames.map((game) => (
                    <Card key={game.id} className="overflow-hidden">
                      <CardHeader className="p-3">
                        <CardTitle className="text-base truncate">{game.name}</CardTitle>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                            game.status === 'active'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}
                        >
                          {game.status === 'active' ? 'Ativo' : 'Encerrado'}
                        </span>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          <div className="text-muted-foreground">Início:</div>
                          <div>{new Date(game.startDate).toLocaleDateString()}</div>
                          
                          <div className="text-muted-foreground">Encerramento:</div>
                          <div>{game.endDate ? new Date(game.endDate).toLocaleDateString() : '-'}</div>
                          
                          <div className="text-muted-foreground">Jogadores:</div>
                          <div>{game.players.length}</div>
                          
                          <div className="text-muted-foreground">Ganhadores:</div>
                          <div>{game.winners?.length || 0}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(game.status === 'active' ? `/admin/${game.id}` : `/history/${game.id}`)}
                        >
                          {game.status === 'active' ? 'Administrar' : 'Visualizar'}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                        
                        <DeleteGameButton gameId={game.id} size="sm" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                // Regular table for desktop
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Encerramento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Jogadores</TableHead>
                      <TableHead>Ganhadores</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGames.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.name}</TableCell>
                        <TableCell>{new Date(game.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {game.endDate ? new Date(game.endDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              game.status === 'active'
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-blue-500/20 text-blue-500'
                            }`}
                          >
                            {game.status === 'active' ? 'Ativo' : 'Encerrado'}
                          </span>
                        </TableCell>
                        <TableCell>{game.players.length}</TableCell>
                        <TableCell>{game.winners?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(game.status === 'active' ? `/admin/${game.id}` : `/history/${game.id}`)}
                            >
                              {game.status === 'active' ? 'Administrar' : 'Visualizar'}
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                            
                            <DeleteGameButton gameId={game.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum jogo encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
