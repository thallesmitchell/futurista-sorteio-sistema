
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import GameAdmin from "./pages/GameAdmin";
import GameHistory from "./pages/GameHistory";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ProfileSettings from "./pages/ProfileSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <GameProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/:gameId" element={<GameAdmin />} />
                <Route path="/history/:gameId" element={<GameHistory />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/super-admin" element={<SuperAdminDashboard />} />
                <Route path="/settings" element={<ProfileSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GameProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
