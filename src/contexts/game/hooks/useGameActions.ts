
import { useState } from 'react';
import { Game, Player, DailyDraw, FinancialProjection, GameFinancialProjections } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for game CRUD operations
 */
export const useGameActions = (games: Game[], setGames: React.Dispatch<React.SetStateAction<Game[]>>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch a specific game by ID
   */
  const fetchGame = async (id: string): Promise<Game | null> => {
    try {
      const game = games.find(g => g.id === id);
      if (game) return game;
      
      // Game not found in state, fetch from database
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (gameError) throw gameError;
      if (!gameData) return null;
      
      // Fetch related data (players, draws, winners)
      const fullGame = await buildGameFromDbData(gameData);
      
      // Add to local state
      setGames(prev => [...prev, fullGame]);
      
      return fullGame;
    } catch (error) {
      console.error('Error fetching game:', error);
      return null;
    }
  };

  /**
   * Helper to build a game object with related data
   */
  const buildGameFromDbData = async (gameData: any): Promise<Game> => {
    // Fetch players
    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameData.id);

    // For each player, fetch combinations
    const players = await Promise.all(
      (playersData || []).map(async (player) => {
        const { data: combinationsData } = await supabase
          .from('player_combinations')
          .select('*')
          .eq('player_id', player.id);

        return {
          id: player.id,
          name: player.name,
          game_id: player.game_id,
          combinations: (combinationsData || []).map(combo => ({
            id: combo.id,
            numbers: combo.numbers,
            hits: combo.hits || 0
          }))
        } as Player;
      })
    );

    // Fetch daily draws
    const { data: dailyDrawsData } = await supabase
      .from('daily_draws')
      .select('*')
      .eq('game_id', gameData.id);

    const dailyDraws = (dailyDrawsData || []).map(draw => ({
      id: draw.id,
      game_id: draw.game_id,
      date: draw.date,
      numbers: draw.numbers,
      created_at: draw.created_at
    })) as DailyDraw[];

    // Fetch winners
    const { data: winnersData } = await supabase
      .from('winners')
      .select('*')
      .eq('game_id', gameData.id);

    const winners = (winnersData || []).map(winner => ({
      id: winner.id,
      game_id: winner.game_id,
      player_id: winner.player_id,
      combination_id: winner.combination_id,
      created_at: winner.created_at,
      prize_amount: winner.prize_amount
    }));

    // Build and return the full game object
    return {
      id: gameData.id,
      name: gameData.name,
      start_date: gameData.start_date,
      end_date: gameData.end_date,
      status: gameData.status,
      players,
      dailyDraws,
      winners,
      owner_id: gameData.owner_id,
      numbersPerSequence: gameData.numbers_per_sequence,
      requiredHits: gameData.required_hits,
      sequencePrice: gameData.sequence_price,
      adminProfitPercentage: gameData.admin_profit_percentage,
      created_at: gameData.created_at
    };
  };

  /**
   * Add a new game to the database and state
   */
  const addGame = async (game: Partial<Game>): Promise<Game> => {
    try {
      if (!game) throw new Error('Game data is required');
      
      // Log what we're sending to Supabase for debugging
      console.log('Adding game with data:', {
        name: game.name,
        start_date: game.start_date,
        end_date: game.end_date,
        status: game.status,
        owner_id: game.owner_id,
        numbers_per_sequence: game.numbersPerSequence,
        required_hits: game.requiredHits,
        sequence_price: game.sequencePrice,
        admin_profit_percentage: game.adminProfitPercentage
      });
      
      // Insert the game into Supabase
      const { data, error } = await supabase
        .from('games')
        .insert({
          name: game.name,
          start_date: game.start_date,
          end_date: game.end_date,
          status: game.status,
          owner_id: game.owner_id,
          user_id: game.owner_id, // For compatibility
          numbers_per_sequence: game.numbersPerSequence || 6,
          required_hits: game.requiredHits || 6,
          sequence_price: game.sequencePrice || 10,
          admin_profit_percentage: game.adminProfitPercentage || 15
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No data returned from insert');
        throw new Error('Error creating game');
      }

      console.log('Game created successfully:', data);

      // Create new game with ID generated by Supabase
      const newGame: Game = {
        id: data.id,
        name: game.name!,
        start_date: game.start_date!,
        end_date: game.end_date,
        status: game.status as 'active' | 'closed' | 'canceled',
        players: [],
        dailyDraws: [],
        winners: [],
        owner_id: game.owner_id!,
        numbersPerSequence: data.numbers_per_sequence || 6,
        requiredHits: data.required_hits || 6,
        sequencePrice: data.sequence_price || 10,
        adminProfitPercentage: data.admin_profit_percentage || 15
      };
      
      // Add to local list
      setGames(prev => [newGame, ...prev]);
      
      return newGame;
    } catch (error) {
      console.error('Error adding game:', error);
      toast({
        title: "Erro ao criar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      throw error;
    }
  };

  /**
   * Update an existing game
   */
  const updateGame = async (id: string, gameUpdates: Partial<Game>): Promise<void> => {
    try {
      // Update the game in Supabase
      const { error } = await supabase
        .from('games')
        .update({
          name: gameUpdates.name,
          start_date: gameUpdates.start_date,
          end_date: gameUpdates.end_date,
          status: gameUpdates.status,
          numbers_per_sequence: gameUpdates.numbersPerSequence,
          required_hits: gameUpdates.requiredHits,
          sequence_price: gameUpdates.sequencePrice,
          admin_profit_percentage: gameUpdates.adminProfitPercentage
        })
        .eq('id', id);

      if (error) throw error;
      
      // Update the local list
      setGames(games.map(game => 
        game.id === id ? { ...game, ...gameUpdates } : game
      ));
    } catch (error) {
      console.error('Error updating game:', error);
      toast({
        title: "Erro ao atualizar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  /**
   * Delete a game from the database and state
   */
  const deleteGame = async (gameId: string): Promise<boolean> => {
    try {
      // Delete the game from Supabase (related tables will be deleted in cascade)
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;
      
      // Update the local list
      setGames(games.filter(game => game.id !== gameId));
      
      return true;
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: "Erro ao excluir jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return false;
    }
  };

  /**
   * Export game to JSON format
   */
  const exportGame = async (gameId: string): Promise<string> => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) throw new Error('Jogo não encontrado');

      // Prepare export format
      const exportData = {
        game: {
          name: game.name,
          start_date: game.start_date,
          end_date: game.end_date,
          status: game.status,
          numbersPerSequence: game.numbersPerSequence,
          requiredHits: game.requiredHits,
          sequencePrice: game.sequencePrice,
          adminProfitPercentage: game.adminProfitPercentage
        },
        players: game.players.map(player => ({
          name: player.name,
          combinations: player.combinations.map(combo => ({
            numbers: combo.numbers,
            hits: combo.hits
          }))
        })),
        dailyDraws: game.dailyDraws.map(draw => ({
          date: draw.date,
          numbers: draw.numbers
        }))
      };

      // Convert to JSON string
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting game:', error);
      toast({
        title: "Erro ao exportar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      throw error;
    }
  };

  /**
   * Import game from JSON format
   */
  const importGame = async (jsonData: string, ownerId: string): Promise<Game> => {
    try {
      // Parse JSON data
      const importData = JSON.parse(jsonData);
      
      // Validate the format
      if (!importData.game || !importData.players) {
        throw new Error('Formato de arquivo inválido');
      }

      // Create the new game first
      const newGame = await addGame({
        name: `${importData.game.name} (Importado)`,
        start_date: importData.game.start_date || new Date().toISOString(),
        end_date: importData.game.end_date,
        status: 'active', // Always start as active
        players: [],
        dailyDraws: [],
        winners: [],
        owner_id: ownerId,
        numbersPerSequence: importData.game.numbersPerSequence || 6,
        requiredHits: importData.game.requiredHits || 6,
        sequencePrice: importData.game.sequencePrice || 10,
        adminProfitPercentage: importData.game.adminProfitPercentage || 15
      });

      // Process all players and their combinations
      for (const playerData of importData.players) {
        // Add player
        const { data: playerInsert } = await supabase
          .from('players')
          .insert({
            name: playerData.name,
            game_id: newGame.id
          })
          .select()
          .single();

        if (playerInsert && playerData.combinations) {
          // Add all combinations for this player
          for (const combo of playerData.combinations) {
            await supabase
              .from('player_combinations')
              .insert({
                player_id: playerInsert.id,
                numbers: combo.numbers
              });
          }
        }
      }

      // Process all daily draws
      if (importData.dailyDraws) {
        for (const drawData of importData.dailyDraws) {
          await supabase
            .from('daily_draws')
            .insert({
              game_id: newGame.id,
              date: drawData.date,
              numbers: drawData.numbers
            });
        }
      }

      // Reload the games to get the updated data
      await loadGamesFromSupabase();

      // Return the new game
      const importedGame = games.find(g => g.id === newGame.id);
      if (!importedGame) throw new Error('Erro ao carregar o jogo importado');
      
      return importedGame;
    } catch (error) {
      console.error('Error importing game:', error);
      toast({
        title: "Erro ao importar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      throw error;
    }
  };

  /**
   * Load games from Supabase
   */
  const loadGamesFromSupabase = async () => {
    setIsLoading(true);
    try {
      // Fetch all games for the user
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

      // Get financial projections for all games
      const { data: financialData, error: financialError } = await supabase
        .from('financial_projections')
        .select('*');

      if (financialError) {
        console.error('Error fetching financial projections:', financialError);
      }

      // For each game, fetch players, daily draws and winners
      const fullGames = await Promise.all(
        gamesData.map(async (game) => {
          // Fetch players
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .eq('game_id', game.id);

          // For each player, fetch their combinations
          const players = await Promise.all(
            (playersData || []).map(async (player) => {
              const { data: combinationsData } = await supabase
                .from('player_combinations')
                .select('*')
                .eq('player_id', player.id);

              return {
                id: player.id,
                name: player.name,
                game_id: game.id, // Ensure game_id is set
                combinations: (combinationsData || []).map(combo => ({
                  id: combo.id,
                  numbers: combo.numbers,
                  hits: combo.hits || 0
                }))
              } as Player;
            })
          );

          // Fetch daily draws
          const { data: dailyDrawsData } = await supabase
            .from('daily_draws')
            .select('*')
            .eq('game_id', game.id)
            .order('date', { ascending: true });

          const dailyDraws = (dailyDrawsData || []).map(draw => ({
            id: draw.id,
            game_id: draw.game_id,
            date: draw.date,
            created_at: draw.created_at,
            numbers: draw.numbers
          })) as DailyDraw[];

          // Fetch winners
          const { data: winnersData } = await supabase
            .from('winners')
            .select('player_id, combination_id, prize_amount, id, game_id, created_at')
            .eq('game_id', game.id);

          // Map winners
          const winners = (winnersData || []).map(w => ({
            id: w.id,
            game_id: w.game_id,
            player_id: w.player_id,
            combination_id: w.combination_id,
            prize_amount: w.prize_amount,
            created_at: w.created_at
          }));

          // Find matching financial projection
          const financialProjection = financialData?.find(fp => fp.id === game.id);
          
          // Build financial projections object if available
          let gameFinancialProjections: GameFinancialProjections | undefined = undefined;
          if (financialProjection) {
            gameFinancialProjections = {
              totalSequences: financialProjection.total_sequences || 0,
              totalCollected: financialProjection.total_collected || 0,
              adminProfit: financialProjection.admin_profit || 0,
              totalPrize: financialProjection.total_prize || 0
            };
          }

          // Ensure the status is always 'active' or 'closed'
          let gameStatus = game.status === 'active' ? 'active' : 'closed';
          
          return {
            id: game.id,
            name: game.name,
            start_date: game.start_date,
            end_date: game.end_date,
            status: gameStatus as 'active' | 'closed' | 'canceled',
            players,
            dailyDraws,
            winners,
            owner_id: game.owner_id,
            numbersPerSequence: game.numbers_per_sequence || 6,
            requiredHits: game.required_hits || 6,
            sequencePrice: game.sequence_price || 10,
            adminProfitPercentage: game.admin_profit_percentage || 15,
            financialProjections: gameFinancialProjections
          } as Game;
        })
      );

      setGames(fullGames.map(game => recalculatePlayerHits(game)));
    } catch (error) {
      console.error('Error loading games:', error);
      toast({
        title: "Erro ao carregar jogos",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate hits for all player combinations based on all drawn numbers
  const recalculatePlayerHits = (game: Game): Game => {
    if (!game.dailyDraws || game.dailyDraws.length === 0) return game;
    
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
    
    const updatedPlayers = game.players.map(player => {
      const updatedCombinations = player.combinations.map(combo => {
        const hits = combo.numbers.filter(num => allDrawnNumbers.includes(num)).length;
        return { ...combo, hits };
      });
      
      return {
        ...player,
        combinations: updatedCombinations
      };
    });
    
    return {
      ...game,
      players: updatedPlayers
    };
  };

  /**
   * Load financial projections for a date range
   */
  const loadFinancialProjections = async (startDate?: string, endDate?: string): Promise<FinancialProjection[]> => {
    try {
      let query = supabase
        .from('financial_projections')
        .select('*');

      if (startDate) {
        query = query.gte('start_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('start_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(item => ({
        id: item.id,
        name: item.name,
        status: item.status,
        start_date: item.start_date,
        end_date: item.end_date,
        startDate: item.start_date, // Alias for backwards compatibility
        endDate: item.end_date, // Alias for backwards compatibility
        totalRevenue: item.total_collected || 0,
        adminProfit: item.admin_profit || 0,
        prizePool: item.total_prize || 0,
        playerCount: 0, // Default values
        combinationCount: 0,
        averagePayout: 0,
        totalSequences: item.total_sequences || 0,
        sequencePrice: item.sequence_price || 0,
        adminProfitPercentage: item.admin_profit_percentage || 0,
        totalCollected: item.total_collected || 0,
        totalPrize: item.total_prize || 0
      })) as FinancialProjection[];
    } catch (error) {
      console.error('Error loading financial projections:', error);
      toast({
        title: "Erro ao carregar projeções financeiras",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return [];
    }
  };

  return { 
    addGame, 
    updateGame, 
    deleteGame, 
    loadGamesFromSupabase,
    recalculatePlayerHits,
    exportGame,
    importGame,
    loadFinancialProjections,
    fetchGame,
    isLoading 
  };
};
