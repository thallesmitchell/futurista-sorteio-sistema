
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/auth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { GamesTabs } from '@/components/dashboard/GamesTabs';
import { container } from '@/lib/utils';

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
