import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import { AppProvider } from './stores/useAppStore'

// Pages
import Index from './pages/Index'
import WorkOrders from './pages/admin/WorkOrders'
import ContractsMaintenance from './pages/admin/ContractsMaintenance'
import ContractsWorks from './pages/admin/ContractsWorks'
import MapPage from './pages/admin/MapPage'
import AuditPage from './pages/admin/AuditPage'
import InventoryPage from './pages/admin/InventoryPage'
import SettingsPage from './pages/admin/SettingsPage'
import NotFound from './pages/NotFound'

import TechQueue from './pages/tech/TechQueue'
import TechExecution from './pages/tech/TechExecution'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/ordens" element={<WorkOrders />} />
            <Route path="/contratos/manutencao" element={<ContractsMaintenance />} />
            <Route path="/contratos/obras" element={<ContractsWorks />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/auditoria" element={<AuditPage />} />
            <Route path="/estoque" element={<InventoryPage />} />
            <Route path="/configs" element={<SettingsPage />} />
            {/* Standard empty routes for completeness */}
            <Route
              path="/veiculos"
              element={
                <div className="p-8 text-center text-muted-foreground">
                  Módulo de Veículos em Desenvolvimento
                </div>
              }
            />
            <Route
              path="/financeiro"
              element={
                <div className="p-8 text-center text-muted-foreground">
                  Módulo Financeiro em Desenvolvimento
                </div>
              }
            />

            {/* Tech Routes */}
            <Route path="/tech" element={<TechQueue />} />
            <Route path="/tech/execucao/:id" element={<TechExecution />} />
            <Route
              path="/tech/rotas"
              element={
                <div className="p-8 text-center text-muted-foreground mt-20">
                  Mapa de Rotas Mobile
                </div>
              }
            />
            <Route
              path="/tech/perfil"
              element={
                <div className="p-8 text-center text-muted-foreground mt-20">Perfil do Técnico</div>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
