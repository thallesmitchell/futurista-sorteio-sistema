
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/auth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { GamesTabs } from '@/components/dashboard/GamesTabs';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { games } = useGame();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Filter active and closed games
  const activeGames = games.filter(game => game.status === 'active');
  const closedGames = games.filter(game => game.status === 'closed');
  
  const handleCreateGameSuccess = (gameId: string) => {
    setIsCreateDialogOpen(false);
    // Redirect to the new game page
    window.location.href = `/game/${gameId}`;
  };
  
  return (
    <div className={`container mx-auto ${isMobile ? 'px-3 py-4' : 'px-4 py-6'}`}>
      <DashboardHeader 
        user={user}
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        onCreateGameSuccess={handleCreateGameSuccess}
      />

      <GamesTabs 
        activeGames={activeGames}
        closedGames={closedGames}
        onCreateGame={() => setIsCreateDialogOpen(true)}
      />
    </div>
  );
};

export default Dashboard;
