
import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Player } from '@/contexts/game/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash } from 'lucide-react';
import { NumberBadge } from './NumberBadge';
import { PlayerEditModal } from './PlayerEditModal';

interface PlayersListProps {
  gameId: string;
}

export const PlayersList = ({ gameId }: PlayersListProps) => {
  const { currentGame, updatePlayerSequences } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  if (!currentGame) {
    return <div>Carregando jogo...</div>;
  }
  
  const players = currentGame.players;
  
  const filteredPlayers = players.filter((player) => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setIsEditModalOpen(true);
  };
  
  const handleSaveSequences = async (playerId: string, sequences: number[][]) => {
    if (!gameId) return;
    await updatePlayerSequences(gameId, playerId, sequences);
  };

  return (
    <div className="space-y-6">
      <Card className="futuristic-card">
        <CardHeader>
          <CardTitle>Participantes</CardTitle>
          <CardDescription>
            {players.length > 0 
              ? `${players.length} jogadores cadastrados neste jogo` 
              : 'Nenhum jogador cadastrado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {players.length > 0 ? (
            <div className="space-y-4">
              <Input
                placeholder="Buscar jogador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              {filteredPlayers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Sequências</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((player) => (
                      <TableRow key={player.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-2">
                            {player.combinations.map((combination, idx) => (
                              <div key={idx} className="flex flex-wrap gap-1">
                                {combination.numbers.map((number, i) => (
                                  <NumberBadge
                                    key={`${player.id}-${idx}-${i}`}
                                    number={number}
                                    size="sm"
                                    hits={combination.hits}
                                  />
                                ))}
                                <span className="text-xs text-muted-foreground ml-2 self-center">
                                  ({combination.hits} acertos)
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(player)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhum jogador encontrado com o nome "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Adicione jogadores no formulário ao lado para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <PlayerEditModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        player={editingPlayer}
        gameId={gameId}
        onSaveSequences={handleSaveSequences}
      />
    </div>
  );
};
