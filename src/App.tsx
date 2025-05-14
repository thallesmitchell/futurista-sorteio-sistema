
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "@/contexts/auth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GameProvider } from "@/contexts/game";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import ProfileSettings from "@/pages/ProfileSettings";
import GameAdmin from "@/pages/GameAdmin";
import PlayersView from "@/pages/PlayersView";
import GameHistory from "@/pages/GameHistory";
import NotFound from "@/pages/NotFound";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import FinancialView from "@/pages/FinancialView";
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <GameProvider>
            <Routes>
              <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
              <Route path="/game/:gameId" element={<MainLayout><GameAdmin /></MainLayout>} />
              <Route path="/players/:gameId?" element={<MainLayout><PlayersView /></MainLayout>} />
              <Route path="/history" element={<MainLayout><GameHistory /></MainLayout>} />
              <Route path="/finance" element={<MainLayout><FinancialView /></MainLayout>} />
              <Route path="/profile" element={<MainLayout><ProfileSettings /></MainLayout>} />
              <Route path="/admin" element={<MainLayout><SuperAdminDashboard /></MainLayout>} />
              <Route path="/super-admin" element={<MainLayout><SuperAdminDashboard /></MainLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </GameProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
