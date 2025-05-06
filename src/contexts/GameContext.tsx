
import { createContext, useContext, useState, ReactNode } from 'react';

// Definindo tipos para nossos dados
export interface CombinationWithHits {
  numbers: number[];
  hits: number;
}

export interface Player {
  id: string;
  name: string;
  combinations: CombinationWithHits[];
  hits?: number; // Mantido para compatibilidade
  numbers?: number[]; // Mantido para compatibilidade
}

export interface DailyDraw {
  id: string;
  date: string;
  numbers: number[];
}

export interface Game {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'closed';
  players: Player[];
  dailyDraws: DailyDraw[];
  winners: Player[];
}

interface GameContextType {
  games: Game[];
  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
  addGame: (game: Omit<Game, 'id'>) => Game;
  updateGame: (id: string, game: Partial<Game>) => void;
  addPlayer: (gameId: string, player: Omit<Player, 'id'>) => void;
  addPlayerCombination: (gameId: string, playerId: string, numbers: number[]) => void;
  updatePlayer: (gameId: string, playerId: string, player: Partial<Player>) => void;
  addDailyDraw: (gameId: string, draw: Omit<DailyDraw, 'id'>) => void;
  checkWinners: (gameId: string) => Player[];
}

// Criando o contexto
const GameContext = createContext<GameContextType | undefined>(undefined);

// Função para gerar IDs únicos
const generateId = () => Math.random().toString(36).substr(2, 9);

// Função para buscar jogos do localStorage
const getGamesFromStorage = (): Game[] => {
  const storedGames = localStorage.getItem('games');
  if (!storedGames) return [];
  
  const parsedGames = JSON.parse(storedGames);
  
  // Converter jogadores antigos para o novo formato
  return parsedGames.map((game: Game) => ({
    ...game,
    players: game.players.map((player: any) => {
      // Se o jogador já tem o campo combinations, retorná-lo como está
      if (player.combinations) return player;
      
      // Caso contrário, converter o formato antigo para o novo
      return {
        ...player,
        combinations: [
          {
            numbers: player.numbers || [],
            hits: player.hits || 0
          }
        ]
      };
    })
  }));
};

// Função para salvar jogos no localStorage
const saveGamesToStorage = (games: Game[]) => {
  localStorage.setItem('games', JSON.stringify(games));
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>(getGamesFromStorage());
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const addGame = (game: Omit<Game, 'id'>) => {
    const newGame = {
      ...game,
      id: generateId(),
      players: [],
      dailyDraws: [],
      winners: []
    };
    
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    return newGame;
  };

  const updateGame = (id: string, gameUpdates: Partial<Game>) => {
    const updatedGames = games.map(game => 
      game.id === id ? { ...game, ...gameUpdates } : game
    );
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    
    // Atualizar o jogo atual se for o que está sendo editado
    if (currentGame && currentGame.id === id) {
      setCurrentGame({ ...currentGame, ...gameUpdates });
    }
  };

  const addPlayer = (gameId: string, player: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...player,
      id: generateId(),
      combinations: player.combinations || []
    };
    
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
    saveGamesToStorage(updatedGames);
    
    // Atualizar o jogo atual se for o que está sendo editado
    if (currentGame && currentGame.id === gameId) {
      setCurrentGame({
        ...currentGame,
        players: [...currentGame.players, newPlayer]
      });
    }
    
    return newPlayer;
  };

  // Adicionar uma nova combinação a um jogador existente
  const addPlayerCombination = (gameId: string, playerId: string, numbers: number[]) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return {
          ...game,
          players: game.players.map(player => {
            if (player.id === playerId) {
              // Verificar acertos da nova combinação
              const drawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
              const hits = numbers.filter(n => drawnNumbers.includes(n)).length;
              
              // Adicionar nova combinação
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
    saveGamesToStorage(updatedGames);
    
    // Atualizar o jogo atual se for o que está sendo editado
    if (currentGame && currentGame.id === gameId) {
      setCurrentGame({
        ...currentGame,
        players: currentGame.players.map(player => {
          if (player.id === playerId) {
            // Verificar acertos da nova combinação
            const drawnNumbers = currentGame.dailyDraws.flatMap(draw => draw.numbers);
            const hits = numbers.filter(n => drawnNumbers.includes(n)).length;
            
            // Adicionar nova combinação
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
  };

  const updatePlayer = (gameId: string, playerId: string, playerUpdates: Partial<Player>) => {
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
    saveGamesToStorage(updatedGames);
    
    // Atualizar o jogo atual se for o que está sendo editado
    if (currentGame && currentGame.id === gameId) {
      setCurrentGame({
        ...currentGame,
        players: currentGame.players.map(player =>
          player.id === playerId ? { ...player, ...playerUpdates } : player
        )
      });
    }
  };

  const addDailyDraw = (gameId: string, draw: Omit<DailyDraw, 'id'>) => {
    const newDraw = {
      ...draw,
      id: generateId()
    };
    
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        // Atualizar acertos dos jogadores
        const updatedPlayers = game.players.map(player => {
          // Atualizar acertos para cada combinação
          const updatedCombinations = player.combinations.map(combo => {
            const newHits = draw.numbers.filter(n => combo.numbers.includes(n)).length;
            return {
              ...combo,
              hits: combo.hits + newHits
            };
          });
          
          // Calcular total de hits para compatibilidade
          const totalHits = updatedCombinations.reduce((sum, combo) => sum + combo.hits, 0);
          
          return {
            ...player,
            combinations: updatedCombinations,
            hits: totalHits // Mantido para compatibilidade
          };
        });
        
        return {
          ...game,
          players: updatedPlayers,
          dailyDraws: [...game.dailyDraws, newDraw]
        };
      }
      return game;
    });
    
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    
    // Atualizar o jogo atual se for o que está sendo editado
    if (currentGame && currentGame.id === gameId) {
      const updatedPlayers = currentGame.players.map(player => {
        // Atualizar acertos para cada combinação
        const updatedCombinations = player.combinations.map(combo => {
          const newHits = draw.numbers.filter(n => combo.numbers.includes(n)).length;
          return {
            ...combo,
            hits: combo.hits + newHits
          };
        });
        
        // Calcular total de hits para compatibilidade
        const totalHits = updatedCombinations.reduce((sum, combo) => sum + combo.hits, 0);
        
        return {
          ...player,
          combinations: updatedCombinations,
          hits: totalHits // Mantido para compatibilidade
        };
      });
      
      setCurrentGame({
        ...currentGame,
        players: updatedPlayers,
        dailyDraws: [...currentGame.dailyDraws, newDraw]
      });
    }
    
    // Verificar se há vencedores após o sorteio
    const updatedGame = updatedGames.find(g => g.id === gameId);
    if (updatedGame) {
      checkWinners(gameId);
    }
    
    return newDraw;
  };

  const checkWinners = (gameId: string): Player[] => {
    const game = games.find(g => g.id === gameId);
    if (!game) return [];
    
    // Agora um vencedor é um jogador com pelo menos uma combinação com 6 acertos
    const winners = game.players.filter(player => 
      player.combinations.some(combo => combo.hits === 6)
    );
    
    if (winners.length > 0 && game.status === 'active') {
      // Atualizar o jogo com os vencedores
      const updatedGames = games.map(g => {
        if (g.id === gameId) {
          return {
            ...g,
            winners,
            status: winners.length > 0 ? 'closed' : g.status,
            endDate: winners.length > 0 ? new Date().toISOString() : g.endDate
          };
        }
        return g;
      });
      
      setGames(updatedGames);
      saveGamesToStorage(updatedGames);
      
      // Atualizar o jogo atual se for o que está sendo verificado
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame({
          ...currentGame,
          winners,
          status: winners.length > 0 ? 'closed' : currentGame.status,
          endDate: winners.length > 0 ? new Date().toISOString() : currentGame.endDate
        });
      }
    }
    
    return winners;
  };

  return (
    <GameContext.Provider value={{
      games,
      currentGame,
      setCurrentGame,
      addGame,
      updateGame,
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

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
