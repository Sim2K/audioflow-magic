import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Record from "./pages/Record";
import Flows from "./pages/Flows";
import Settings from "./pages/Settings";
import Transcripts from "./pages/Transcripts";
import IOSMicTest from "./pages/ios-mic-test";

const queryClient = new QueryClient();

function AppLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/ios-mic-test" element={<IOSMicTest />} />
            <Route element={<AppLayout />}>
              <Route path="/record" element={<Record />} />
              <Route path="/flows" element={<Flows />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/transcripts" element={<Transcripts />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;