
import { createContext, useContext, useState, ReactNode } from 'react';

// Definindo tipos para nossos dados
export interface Player {
  id: string;
  name: string;
  numbers: number[];
  hits: number;
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
  addPlayer: (gameId: string, player: Omit<Player, 'id' | 'hits'>) => void;
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
  return storedGames ? JSON.parse(storedGames) : [];
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

  const addPlayer = (gameId: string, player: Omit<Player, 'id' | 'hits'>) => {
    const newPlayer = {
      ...player,
      id: generateId(),
      hits: 0
    };
    
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        // Não verificamos duplicatas de números entre jogadores, essa regra foi removida
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
          const newHits = draw.numbers.filter(n => player.numbers.includes(n)).length;
          return {
            ...player,
            hits: player.hits + newHits
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
        const newHits = draw.numbers.filter(n => player.numbers.includes(n)).length;
        return {
          ...player,
          hits: player.hits + newHits
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
    
    const winners = game.players.filter(player => player.hits >= 6);
    
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
