
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/auth";
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

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('supabase.auth.token');
  return token ? children : <Navigate to="/login" />;
};

// Super admin guard
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role;
  return userRole === 'super_admin' ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GameProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
              
              <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/game/:gameId" element={
                <ProtectedRoute>
                  <MainLayout>
                    <GameAdmin />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/players" element={
                <ProtectedRoute>
                  <MainLayout>
                    <PlayersView />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <MainLayout>
                    <GameHistory />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/finance" element={
                <ProtectedRoute>
                  <MainLayout>
                    <FinancialView />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfileSettings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute>
                  <SuperAdminRoute>
                    <MainLayout>
                      <SuperAdminDashboard />
                    </MainLayout>
                  </SuperAdminRoute>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
