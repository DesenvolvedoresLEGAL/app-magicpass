import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import EventoDetalhes from "./pages/EventoDetalhes";
import Credenciamento from "./pages/Credenciamento";
import TempoReal from "./pages/TempoReal";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import PublicRegister from "./pages/PublicRegister";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<EventoDetalhes />} />
            <Route path="/credenciamento" element={<Credenciamento />} />
            <Route path="/tempo-real" element={<TempoReal />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/config" element={<Configuracoes />} />
            {/* Portal público de inscrição */}
            <Route path="/inscricao/:eventId" element={<PublicRegister />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
