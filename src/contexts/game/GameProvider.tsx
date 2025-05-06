
import { ReactNode, useState, useEffect } from 'react';
import { GameContext } from './GameContext';
import { Game, Player, DailyDraw } from './types';
import { generateId } from './utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Carregar jogos do Supabase quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      loadGamesFromSupabase();
    } else {
      setGames([]);
      setCurrentGame(null);
    }
  }, [isAuthenticated, user]);

  const loadGamesFromSupabase = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os jogos do usuário
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (gamesError) {
        throw gamesError;
      }

      if (!gamesData) {
        setGames([]);
        setIsLoading(false);
        return;
      }

      // Para cada jogo, buscar players, daily draws e winners
      const fullGames = await Promise.all(
        gamesData.map(async (game) => {
          // Buscar jogadores
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .eq('game_id', game.id);

          // Para cada jogador, buscar suas combinações
          const players = await Promise.all(
            (playersData || []).map(async (player) => {
              const { data: combinationsData } = await supabase
                .from('player_combinations')
                .select('*')
                .eq('player_id', player.id);

              return {
                id: player.id,
                name: player.name,
                combinations: (combinationsData || []).map(combo => ({
                  numbers: combo.numbers,
                  hits: combo.hits
                }))
              } as Player;
            })
          );

          // Buscar sorteios diários
          const { data: dailyDrawsData } = await supabase
            .from('daily_draws')
            .select('*')
            .eq('game_id', game.id)
            .order('date', { ascending: true });

          const dailyDraws = (dailyDrawsData || []).map(draw => ({
            id: draw.id,
            date: draw.date,
            numbers: draw.numbers
          })) as DailyDraw[];

          // Buscar vencedores
          const { data: winnersData } = await supabase
            .from('winners')
            .select('player_id, combination_id')
            .eq('game_id', game.id);

          // Mapear os vencedores para os jogadores correspondentes
          let winners: Player[] = [];
          if (winnersData && winnersData.length > 0) {
            // Criar um conjunto de IDs de jogadores vencedores
            const winnerPlayerIds = [...new Set(winnersData.map(w => w.player_id))];
            
            // Filtrar os jogadores vencedores da lista de players
            winners = players.filter(player => 
              winnerPlayerIds.includes(player.id)
            );
          }

          return {
            id: game.id,
            name: game.name,
            startDate: game.start_date,
            endDate: game.end_date,
            status: game.status,
            players,
            dailyDraws,
            winners
          } as Game;
        })
      );

      setGames(fullGames);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      toast({
        title: "Erro ao carregar jogos",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addGame = async (game: Omit<Game, 'id'>): Promise<Game> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Inserir o jogo no Supabase
      const { data, error } = await supabase
        .from('games')
        .insert({
          name: game.name,
          start_date: game.startDate,
          end_date: game.endDate,
          status: game.status,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Erro ao criar jogo');

      // Criar novo jogo com ID gerado pelo Supabase
      const newGame: Game = {
        id: data.id,
        name: game.name,
        startDate: game.startDate,
        endDate: game.endDate,
        status: game.status,
        players: [],
        dailyDraws: [],
        winners: []
      };
      
      // Adicionar à lista local
      setGames(prev => [newGame, ...prev]);
      
      return newGame;
    } catch (error) {
      console.error('Erro ao adicionar jogo:', error);
      toast({
        title: "Erro ao criar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateGame = async (id: string, gameUpdates: Partial<Game>) => {
    try {
      // Atualizar o jogo no Supabase
      const { error } = await supabase
        .from('games')
        .update({
          name: gameUpdates.name,
          start_date: gameUpdates.startDate,
          end_date: gameUpdates.endDate,
          status: gameUpdates.status
        })
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar na lista local
      const updatedGames = games.map(game => 
        game.id === id ? { ...game, ...gameUpdates } : game
      );
      setGames(updatedGames);
      
      // Atualizar jogo atual se estiver sendo editado
      if (currentGame && currentGame.id === id) {
        setCurrentGame({ ...currentGame, ...gameUpdates });
      }
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
      toast({
        title: "Erro ao atualizar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const addPlayer = async (gameId: string, player: Omit<Player, 'id'>) => {
    try {
      // Inserir o jogador no Supabase
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          name: player.name,
          game_id: gameId
        })
        .select()
        .single();

      if (playerError) throw playerError;
      if (!playerData) throw new Error('Erro ao adicionar jogador');

      const newPlayer: Player = {
        id: playerData.id,
        name: player.name,
        combinations: []
      };

      // Se houver combinações, adicioná-las
      if (player.combinations && player.combinations.length > 0) {
        for (const combination of player.combinations) {
          // Adicionar combinação ao Supabase
          const { data: comboData, error: comboError } = await supabase
            .from('player_combinations')
            .insert({
              player_id: newPlayer.id,
              numbers: combination.numbers,
              hits: combination.hits || 0
            })
            .select()
            .single();

          if (comboError) throw comboError;
          
          // Adicionar à lista local
          if (comboData) {
            newPlayer.combinations.push({
              numbers: comboData.numbers,
              hits: comboData.hits
            });
          }
        }
      }
      
      // Atualizar a lista local
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return {
            ...game,
            players: [...game.players, newPlayer]
          };
        }
        return game;
      });
      
      setGames(updatedGames);
      
      // Atualizar jogo atual se estiver sendo editado
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          players: [...currentGame.players, newPlayer]
        });
      }
      
      return newPlayer;
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      toast({
        title: "Erro ao adicionar jogador",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addPlayerCombination = async (gameId: string, playerId: string, numbers: number[]) => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) throw new Error('Jogo não encontrado');

      // Calcular hits baseado nos números já sorteados
      const drawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
      const hits = numbers.filter(n => drawnNumbers.includes(n)).length;
      
      // Adicionar combinação ao Supabase
      const { data: comboData, error: comboError } = await supabase
        .from('player_combinations')
        .insert({
          player_id: playerId,
          numbers,
          hits
        })
        .select()
        .single();

      if (comboError) throw comboError;
      if (!comboData) throw new Error('Erro ao adicionar combinação');
      
      // Atualizar a lista local
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return {
            ...game,
            players: game.players.map(player => {
              if (player.id === playerId) {
                return {
                  ...player,
                  combinations: [
                    ...player.combinations,
                    { numbers, hits }
                  ]
                };
              }
              return player;
            })
          };
        }
        return game;
      });
      
      setGames(updatedGames);
      
      // Atualizar jogo atual se estiver sendo editado
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          players: currentGame.players.map(player => {
            if (player.id === playerId) {
              return {
                ...player,
                combinations: [
                  ...player.combinations,
                  { numbers, hits }
                ]
              };
            }
            return player;
          })
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar combinação:', error);
      toast({
        title: "Erro ao adicionar combinação",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const updatePlayer = async (gameId: string, playerId: string, playerUpdates: Partial<Player>) => {
    try {
      // Atualizar o jogador no Supabase
      if (playerUpdates.name) {
        const { error } = await supabase
          .from('players')
          .update({ name: playerUpdates.name })
          .eq('id', playerId);

        if (error) throw error;
      }
      
      // Atualizar a lista local
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return {
            ...game,
            players: game.players.map(player => 
              player.id === playerId ? { ...player, ...playerUpdates } : player
            )
          };
        }
        return game;
      });
      
      setGames(updatedGames);
      
      // Atualizar jogo atual se estiver sendo editado
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          players: currentGame.players.map(player =>
            player.id === playerId ? { ...player, ...playerUpdates } : player
          )
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      toast({
        title: "Erro ao atualizar jogador",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const addDailyDraw = async (gameId: string, draw: Omit<DailyDraw, 'id'>) => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) throw new Error('Jogo não encontrado');

      // Inserir o sorteio no Supabase
      const { data: drawData, error: drawError } = await supabase
        .from('daily_draws')
        .insert({
          game_id: gameId,
          date: draw.date,
          numbers: draw.numbers
        })
        .select()
        .single();

      if (drawError) throw drawError;
      if (!drawData) throw new Error('Erro ao adicionar sorteio');

      const newDraw: DailyDraw = {
        id: drawData.id,
        date: drawData.date,
        numbers: drawData.numbers
      };
      
      // Atualizar os hits dos jogadores
      for (const player of game.players) {
        for (const combo of player.combinations) {
          // Calcular novos hits
          const newHits = draw.numbers.filter(n => combo.numbers.includes(n)).length;
          
          if (newHits > 0) {
            // Atualizar hits no Supabase
            await supabase
              .from('player_combinations')
              .update({ 
                hits: combo.hits + newHits 
              })
              .eq('player_id', player.id)
              .eq('numbers', combo.numbers);
              
            // Atualizar combo localmente
            combo.hits += newHits;
          }
        }
      }

      // Atualizar a lista local
      const updatedGames = games.map(g => {
        if (g.id === gameId) {
          return {
            ...g,
            dailyDraws: [...g.dailyDraws, newDraw]
          };
        }
        return g;
      });
      
      setGames(updatedGames);
      
      // Atualizar jogo atual se estiver sendo editado
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          dailyDraws: [...currentGame.dailyDraws, newDraw]
        });
      }
      
      // Verificar vencedores
      const updatedGame = updatedGames.find(g => g.id === gameId);
      if (updatedGame) {
        await checkWinners(gameId);
      }
      
      return newDraw;
    } catch (error) {
      console.error('Erro ao adicionar sorteio:', error);
      toast({
        title: "Erro ao adicionar sorteio",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      throw error;
    }
  };

  const checkWinners = async (gameId: string): Promise<Player[]> => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return [];
      
      // Um vencedor é um jogador com pelo menos uma combinação que tem exatamente 6 acertos
      const winners = game.players.filter(player => 
        player.combinations.some(combo => combo.hits === 6)
      );
      
      if (winners.length > 0 && game.status === 'active') {
        // Atualizar jogo para finalizado
        await supabase
          .from('games')
          .update({
            status: 'closed',
            end_date: new Date().toISOString()
          })
          .eq('id', gameId);
          
        // Registrar vencedores no Supabase
        for (const winner of winners) {
          // Encontrar as combinações vencedoras
          const winningCombinations = winner.combinations.filter(combo => combo.hits === 6);
          
          for (const combo of winningCombinations) {
            // Encontrar a combinação específica no banco de dados
            const { data: comboData } = await supabase
              .from('player_combinations')
              .select('id')
              .eq('player_id', winner.id)
              .eq('numbers', combo.numbers)
              .single();
              
            if (comboData) {
              // Registrar o vencedor
              await supabase
                .from('winners')
                .insert({
                  game_id: gameId,
                  player_id: winner.id,
                  combination_id: comboData.id
                });
            }
          }
        }
        
        // Atualizar a lista local
        const updatedGames = games.map(g => {
          if (g.id === gameId) {
            return {
              ...g,
              winners,
              status: 'closed',
              endDate: new Date().toISOString()
            };
          }
          return g;
        });
        
        setGames(updatedGames);
        
        // Atualizar jogo atual se estiver sendo verificado
        if (currentGame && currentGame.id === gameId) {
          setCurrentGame({
            ...currentGame,
            winners,
            status: 'closed',
            endDate: new Date().toISOString()
          });
        }
      }
      
      return winners;
    } catch (error) {
      console.error('Erro ao verificar vencedores:', error);
      toast({
        title: "Erro ao verificar vencedores",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      return [];
    }
  };

  const deleteGame = async (gameId: string): Promise<boolean> => {
    try {
      // Excluir o jogo do Supabase (as tabelas relacionadas serão excluídas em cascata)
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;
      
      // Atualizar a lista local
      const updatedGames = games.filter(game => game.id !== gameId);
      setGames(updatedGames);
      
      // Resetar jogo atual se foi excluído
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame(null);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
      toast({
        title: "Erro ao excluir jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <GameContext.Provider value={{
      games,
      currentGame,
      setCurrentGame,
      addGame,
      updateGame,
      deleteGame,
      addPlayer,
      addPlayerCombination,
      updatePlayer,
      addDailyDraw,
      checkWinners
    }}>
      {children}
    </GameContext.Provider>
  );
}
