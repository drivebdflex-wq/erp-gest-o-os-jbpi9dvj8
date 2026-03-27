import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import { AppProvider } from './stores/useAppStore'
import { FinanceProvider } from './stores/useFinanceStore'
import { NotificationProvider } from './stores/useNotificationStore'

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

import FinanceDashboard from './pages/admin/finance/FinanceDashboard'
import ContractFinanceDetail from './pages/admin/finance/ContractFinanceDetail'
import RevenuesPage from './pages/admin/finance/RevenuesPage'
import PurchasesPage from './pages/admin/finance/PurchasesPage'
import CostsPage from './pages/admin/finance/CostsPage'
import DREPage from './pages/admin/finance/DREPage'
import CashFlowPage from './pages/admin/finance/CashFlowPage'
import TechFinancePage from './pages/admin/finance/TechFinancePage'

import TechQueue from './pages/tech/TechQueue'
import TechExecution from './pages/tech/TechExecution'

const App = () => (
  <AppProvider>
    <NotificationProvider>
      <FinanceProvider>
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
                <Route path="/configs" element={<SettingsPage />} />

                {/* Financeiro */}
                <Route path="/financeiro/dashboard" element={<FinanceDashboard />} />
                <Route path="/financeiro/contrato/:id" element={<ContractFinanceDetail />} />
                <Route path="/financeiro/receitas" element={<RevenuesPage />} />
                <Route path="/financeiro/compras" element={<PurchasesPage />} />
                <Route path="/financeiro/custos" element={<CostsPage />} />
                <Route path="/financeiro/estoque" element={<InventoryPage />} />
                <Route path="/financeiro/dre" element={<DREPage />} />
                <Route path="/financeiro/fluxo-caixa" element={<CashFlowPage />} />
                <Route path="/financeiro/tecnicos" element={<TechFinancePage />} />

                <Route
                  path="/veiculos"
                  element={
                    <div className="p-8 text-center text-muted-foreground">
                      Módulo de Veículos em Desenvolvimento
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
                    <div className="p-8 text-center text-muted-foreground mt-20">
                      Perfil do Técnico
                    </div>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </FinanceProvider>
    </NotificationProvider>
  </AppProvider>
)

export default App
