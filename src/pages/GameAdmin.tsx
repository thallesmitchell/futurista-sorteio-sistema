
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useGame, Player, DailyDraw } from '@/contexts/GameContext';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { TabsController } from '@/components/game/TabsController';
import { PlayerEditModal } from '@/components/game/PlayerEditModal';
import { ConfirmCloseModal } from '@/components/game/ConfirmCloseModal';
import { WinnersModal } from '@/components/game/WinnersModal';
import { useIsMobile } from '@/hooks/use-mobile';

export default function GameAdmin() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    games, 
    currentGame, 
    setCurrentGame, 
    updateGame, 
    addPlayer, 
    addPlayerCombination, 
    updatePlayer, 
    addDailyDraw, 
    checkWinners 
  } = useGame();
  const isMobile = useIsMobile();
  
  // Estados para edição de jogador
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [editPlayerNumbers, setEditPlayerNumbers] = useState('');
  
  // Estado para confirmação de encerramento
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  
  // Estado para mostrar modal de vencedores
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [winners, setWinners] = useState<Player[]>([]);
  
  // Estado para rastrear ganhadores durante o jogo
  const [currentWinners, setCurrentWinners] = useState<Player[]>([]);

  // Carregar jogo atual quando o componente montar ou o ID mudar
  useEffect(() => {
    if (!gameId) return;
    
    const game = games.find(g => g.id === gameId);
    if (game) {
      setCurrentGame(game);
      
      // Verificar jogadores com combinações de 6 acertos
      const potentialWinners = game.players.filter(p => 
        p.combinations && p.combinations.some(combo => combo.hits === 6)
      );
      setCurrentWinners(potentialWinners);
      
      // Verificar se já existe vencedores
      if (game.winners && game.winners.length > 0) {
        setWinners(game.winners);
        setShowWinnersModal(true);
      }
    } else {
      toast({
        title: "Jogo não encontrado",
        description: "O jogo solicitado não existe ou foi removido.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [gameId, games, setCurrentGame, navigate, toast]);
  
  if (!currentGame) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-muted-foreground">Carregando jogo...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Verificar se o jogo está fechado
  if (currentGame.status === 'closed') {
    navigate(`/history/${gameId}`);
    return null;
  }

  // Verificar números já sorteados
  const allDrawnNumbers = currentGame.dailyDraws.flatMap(draw => draw.numbers);

  // Função para processar string de números, aceitando vírgula ou ponto como separador
  const processNumberString = (numberStr: string): number[] => {
    // Substituir pontos por vírgulas
    const normalizedStr = numberStr.replace(/\./g, ',');
    
    // Processar os números
    return normalizedStr
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0 && n <= 80); // Números de 1 a 80 são válidos
  };

  // Manipuladores para o formulário de jogador
  const handleAddPlayer = (name: string, numbersArray: number[]) => {
    try {
      // Adicionar jogador
      addPlayer(currentGame.id, {
        name: name,
        combinations: [{ numbers: numbersArray, hits: 0 }]
      });
      
      toast({
        title: "Jogador adicionado",
        description: `${name} foi adicionado com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar jogador",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };
  
  // Handler para adicionar uma nova combinação a um jogador existente
  const handleAddCombination = (playerId: string, numbersArray: number[]) => {
    try {
      // Adicionar combinação ao jogador
      addPlayerCombination(currentGame.id, playerId, numbersArray);
      
      const player = currentGame.players.find(p => p.id === playerId);
      if (player) {
        toast({
          title: "Combinação adicionada",
          description: `Nova combinação adicionada para ${player.name}`
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar combinação",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };
  
  // Manipuladores para edição de jogador
  const handleOpenEditPlayerModal = (player: Player) => {
    setPlayerToEdit(player);
    // Para manter compatibilidade, vamos apenas exibir a primeira combinação no editor por enquanto
    if (player.combinations && player.combinations.length > 0) {
      setEditPlayerNumbers(player.combinations[0].numbers.join(', '));
    } else {
      setEditPlayerNumbers('');
    }
    setIsEditingPlayer(true);
  };
  
  const handleSavePlayerEdit = () => {
    if (!playerToEdit) return;
    
    try {
      // Validar e converter números
      const numbersArray = processNumberString(editPlayerNumbers);
      
      if (numbersArray.length !== 6) {
        toast({
          title: "Quantidade inválida de números",
          description: "Você precisa selecionar exatamente 6 números",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar duplicatas
      const uniqueNumbers = [...new Set(numbersArray)];
      if (uniqueNumbers.length !== numbersArray.length) {
        toast({
          title: "Números duplicados",
          description: "Remova os números duplicados da lista",
          variant: "destructive"
        });
        return;
      }
      
      // Para manter compatibilidade, atualizar apenas a primeira combinação
      if (playerToEdit.combinations && playerToEdit.combinations.length > 0) {
        const updatedCombinations = [...playerToEdit.combinations];
        updatedCombinations[0] = { 
          ...updatedCombinations[0],
          numbers: uniqueNumbers
        };
        
        // Atualizar jogador
        updatePlayer(currentGame.id, playerToEdit.id, {
          combinations: updatedCombinations
        });
      }
      
      // Fechar modal
      setIsEditingPlayer(false);
      setPlayerToEdit(null);
      
      toast({
        title: "Jogador atualizado",
        description: `Os números de ${playerToEdit.name} foram atualizados`
      });
      
    } catch (error) {
      toast({
        title: "Erro ao editar jogador",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  // Manipuladores para o sorteio diário
  const handleAddDraw = (date: string, numbersArray: number[]) => {
    try {
      // Adicionar sorteio
      const newDraw: Omit<DailyDraw, 'id'> = {
        date: date,
        numbers: numbersArray
      };
      
      addDailyDraw(currentGame.id, newDraw);
      
      // Verificar vencedores
      const gameWinners = checkWinners(currentGame.id);
      
      // Atualizar lista de vencedores em potencial
      const potentialWinners = currentGame.players.filter(p => 
        p.combinations && p.combinations.some(combo => combo.hits === 6)
      );
      setCurrentWinners(potentialWinners);
      
      if (gameWinners.length > 0) {
        setWinners(gameWinners);
        setShowWinnersModal(true);
      }
      
      toast({
        title: "Sorteio registrado",
        description: `O sorteio do dia ${new Date(date).toLocaleDateString()} foi registrado`
      });
      
    } catch (error) {
      toast({
        title: "Erro ao registrar sorteio",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };
  
  // Encerrar jogo
  const handleCloseGame = () => {
    updateGame(currentGame.id, {
      status: 'closed',
      endDate: new Date().toISOString()
    });
    
    toast({
      title: "Jogo encerrado",
      description: `O jogo "${currentGame.name}" foi encerrado com sucesso`
    });
    
    navigate(`/history/${currentGame.id}`);
  };

  // Manipulador para fechar o modal de vencedores
  const handleWinnerModalClose = () => {
    setShowWinnersModal(false);
    if (winners.length > 0) {
      updateGame(currentGame.id, {
        status: 'closed',
        endDate: new Date().toISOString(),
        winners
      });
      navigate(`/history/${currentGame.id}`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold`}>{currentGame.name}</h1>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
              Iniciado em {new Date(currentGame.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className={isMobile ? "text-xs px-2 py-1 h-8" : ""}
            >
              Voltar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsConfirmingClose(true)}
              className={isMobile ? "text-xs px-2 py-1 h-8" : ""}
            >
              Encerrar Jogo
            </Button>
          </div>
        </div>

        <TabsController 
          players={currentGame.players}
          dailyDraws={currentGame.dailyDraws}
          allDrawnNumbers={allDrawnNumbers}
          currentWinners={currentWinners}
          processNumberString={processNumberString}
          onAddPlayer={handleAddPlayer}
          onAddCombination={handleAddCombination}
          onEditPlayer={handleOpenEditPlayerModal}
          onAddDraw={handleAddDraw}
        />
      </div>

      {/* Modals */}
      <PlayerEditModal 
        isOpen={isEditingPlayer}
        setIsOpen={setIsEditingPlayer}
        playerToEdit={playerToEdit}
        editPlayerNumbers={editPlayerNumbers}
        setEditPlayerNumbers={setEditPlayerNumbers}
        onSave={handleSavePlayerEdit}
      />

      <ConfirmCloseModal 
        isOpen={isConfirmingClose}
        setIsOpen={setIsConfirmingClose}
        onConfirm={handleCloseGame}
      />

      <WinnersModal 
        isOpen={showWinnersModal}
        setIsOpen={setShowWinnersModal}
        winners={winners}
        allDrawnNumbers={allDrawnNumbers}
        onClose={handleWinnerModalClose}
      />
    </MainLayout>
  );
}
