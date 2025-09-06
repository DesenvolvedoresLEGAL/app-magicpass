import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ClientLayout } from "./components/layout/ClientLayout";

// Auth
import AuthPage from "./pages/auth/AuthPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Organizations from "./pages/admin/Organizations";
import Users from "./pages/admin/Users";

// Client Pages (antigas páginas principais)
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import EventoDetalhes from "./pages/EventoDetalhes";
import Credenciamento from "./pages/Credenciamento";
import TempoReal from "./pages/TempoReal";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

// Public Pages
import PublicRegister from "./pages/PublicRegister";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Root redirect based on user role */}
      <Route path="/" element={
        user && userRole ? (
          userRole === 'legal_admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/client" replace />
          )
        ) : (
          <Navigate to="/auth" replace />
        )
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="legal_admin">
          <AdminLayout>
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="users" element={<Users />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Client Routes */}
      <Route path="/client/*" element={
        <ProtectedRoute requiredRole={['client_admin', 'client_operator']}>
          <ClientLayout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="eventos/:id" element={<EventoDetalhes />} />
              <Route path="credenciamento" element={<Credenciamento />} />
              <Route path="tempo-real" element={<TempoReal />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="config" element={<Configuracoes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ClientLayout>
        </ProtectedRoute>
      } />

      {/* Public Routes */}
      <Route path="/inscricao/:eventId" element={<PublicRegister />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
