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
import Home from "./pages/Home";
import Features from "./pages/Features";
import Record from "./pages/Record";
import Flows from "./pages/Flows";
import Settings from "./pages/Settings";
import Transcripts from "./pages/Transcripts";

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
                <div className="min-h-screen bg-background">
                  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center justify-between">
                      <div className="mr-4">
                        <a href="/" className="flex items-center space-x-2">
                          <span className="font-bold">AIAudioFlow</span>
                        </a>
                      </div>
                      <MenuDropdown />
                    </div>
                  </header>
                  <Home />
                </div>
              } />
              <Route path="/features" element={
                <div className="min-h-screen bg-background">
                  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center justify-between">
                      <div className="mr-4">
                        <a href="/" className="flex items-center space-x-2">
                          <span className="font-bold">AIAudioFlow</span>
                        </a>
                      </div>
                      <MenuDropdown />
                    </div>
                  </header>
                  <Features />
                </div>
              } />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

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