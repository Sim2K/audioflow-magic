import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MenuDropdown } from './components/navigation/MenuDropdown';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { MainLayout } from "./components/layout/MainLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Record from "./pages/Record";
import Flows from "./pages/Flows";
import Settings from "./pages/Settings";
import Transcripts from "./pages/Transcripts";
import Test from "./pages/Test";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              } />
              <Route path="/features" element={
                <PublicLayout>
                  <Features />
                </PublicLayout>
              } />
              <Route path="/test" element={
                <PublicLayout>
                  <Test />
                </PublicLayout>
              } />
              
              {/* Auth Routes */}
              <Route path="/auth/login" element={
                <PublicLayout>
                  <LoginPage />
                </PublicLayout>
              } />
              <Route path="/auth/register" element={
                <PublicLayout>
                  <RegisterPage />
                </PublicLayout>
              } />
              <Route path="/auth/reset-password" element={
                <PublicLayout>
                  <ResetPasswordPage />
                </PublicLayout>
              } />

              {/* Protected App Routes */}
              <Route path="/record" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Record />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/flows" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Flows />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/transcripts" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Transcripts />
                  </MainLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;