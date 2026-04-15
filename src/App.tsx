import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import { AuthProvider } from './stores/useAuthStore'
import { AppProvider } from './stores/useAppStore'
import { FinanceProvider } from './stores/useFinanceStore'
import { NotificationProvider } from './stores/useNotificationStore'
import { FleetProvider } from './stores/useFleetStore'
import { InventoryProvider } from './stores/useInventoryStore'
import { OperationalProvider } from './stores/useOperationalStore'
import { useSystemStore } from './stores/useSystemStore'

// Pages
import Login from './pages/Login'
import Index from './pages/Index'
import WorkOrders from './pages/admin/WorkOrders'
import ContractsMaintenance from './pages/admin/ContractsMaintenance'
import ContractsWorks from './pages/admin/ContractsWorks'
import MapPage from './pages/admin/MapPage'
import AuditPage from './pages/admin/AuditPage'
import SettingsPage from './pages/admin/SettingsPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'
import RecycleBinPage from './pages/admin/RecycleBinPage'
import NotFound from './pages/NotFound'

// Estoque
import InventoryDashboard from './pages/admin/inventory/InventoryDashboard'
import ProductsPage from './pages/admin/inventory/ProductsPage'
import CentralWarehousePage from './pages/admin/inventory/CentralWarehousePage'
import VehicleStockPage from './pages/admin/inventory/VehicleStockPage'
import MovementsPage from './pages/admin/inventory/MovementsPage'
import RequisitionsPage from './pages/admin/inventory/RequisitionsPage'
import PhysicalInventoryPage from './pages/admin/inventory/PhysicalInventoryPage'

// Financeiro
import FinanceDashboard from './pages/admin/finance/FinanceDashboard'
import ContractFinanceDetail from './pages/admin/finance/ContractFinanceDetail'
import RevenuesPage from './pages/admin/finance/RevenuesPage'
import PurchasesPage from './pages/admin/finance/PurchasesPage'
import CostsPage from './pages/admin/finance/CostsPage'
import DREPage from './pages/admin/finance/DREPage'
import CashFlowPage from './pages/admin/finance/CashFlowPage'
import TechFinancePage from './pages/admin/finance/TechFinancePage'
import FinanceInventoryPage from './pages/admin/finance/InventoryPage'

// Frotas
import FleetDashboard from './pages/admin/fleet/FleetDashboard'
import VehiclesPage from './pages/admin/fleet/VehiclesPage'
import VehicleDetailPage from './pages/admin/fleet/VehicleDetailPage'
import DriversPage from './pages/admin/fleet/DriversPage'
import MaintenancePage from './pages/admin/fleet/MaintenancePage'
import RefuelingPage from './pages/admin/fleet/RefuelingPage'
import FleetHistoryPage from './pages/admin/fleet/FleetHistoryPage'

// Operacional
import OpDashboard from './pages/admin/operational/OpDashboard'
import SupervisorPanelPage from './pages/admin/operational/SupervisorPanelPage'
import OperationalAgendaPage from './pages/admin/operational/OperationalAgendaPage'
import TechniciansPage from './pages/admin/operational/TechniciansPage'
import TeamsPage from './pages/admin/operational/TeamsPage'
import IndicatorsPage from './pages/admin/operational/IndicatorsPage'
import EventsPage from './pages/admin/operational/EventsPage'
import FeedbackPDIPage from './pages/admin/operational/FeedbackPDIPage'
import HistoryPage from './pages/admin/operational/HistoryPage'

// Tech Routes
import TechQueue from './pages/tech/TechQueue'
import TechExecution from './pages/tech/TechExecution'

const App = () => {
  useEffect(() => {
    try {
      // Run retention policy safely
      useSystemStore.getState().runRetentionPolicy()
    } catch (err) {
      console.error('Failed to run retention policy during app initialization:', err)
    }
  }, [])

  return (
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <FinanceProvider>
            <FleetProvider>
              <InventoryProvider>
                <OperationalProvider>
                  <BrowserRouter
                    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
                  >
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route element={<ProtectedRoute />}>
                          <Route element={<Layout />}>
                            {/* Common Authenticated Routes */}
                            <Route path="/" element={<Index />} />
                            <Route path="/ordens" element={<WorkOrders />} />

                            <Route
                              element={<ProtectedRoute requiredPermission="view_operational" />}
                            >
                              <Route path="/mapa" element={<MapPage />} />
                              <Route path="/operacional/dashboard" element={<OpDashboard />} />
                              <Route path="/operacional/painel" element={<SupervisorPanelPage />} />
                              <Route
                                path="/operacional/agenda"
                                element={<OperationalAgendaPage />}
                              />
                              <Route path="/operacional/tecnicos" element={<TechniciansPage />} />
                              <Route path="/operacional/equipes" element={<TeamsPage />} />
                              <Route path="/operacional/indicadores" element={<IndicatorsPage />} />
                              <Route path="/operacional/eventos" element={<EventsPage />} />
                              <Route path="/operacional/feedback" element={<FeedbackPDIPage />} />
                              <Route path="/operacional/historico" element={<HistoryPage />} />
                            </Route>

                            <Route
                              element={<ProtectedRoute requiredPermission="manage_contracts" />}
                            >
                              <Route
                                path="/contratos/manutencao"
                                element={<ContractsMaintenance />}
                              />
                              <Route path="/contratos/obras" element={<ContractsWorks />} />
                            </Route>

                            <Route
                              element={<ProtectedRoute requiredPermission="edit_service_order" />}
                            >
                              <Route path="/auditoria" element={<AuditPage />} />
                            </Route>

                            <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
                              <Route path="/configs" element={<SettingsPage />} />
                              <Route path="/logs-auditoria" element={<AuditLogsPage />} />
                              <Route path="/lixeira" element={<RecycleBinPage />} />
                            </Route>

                            <Route element={<ProtectedRoute requiredPermission="manage_stock" />}>
                              <Route path="/estoque/dashboard" element={<InventoryDashboard />} />
                              <Route path="/estoque/produtos" element={<ProductsPage />} />
                              <Route
                                path="/estoque/almoxarifado"
                                element={<CentralWarehousePage />}
                              />
                              <Route path="/estoque/veiculos" element={<VehicleStockPage />} />
                              <Route path="/estoque/movimentacoes" element={<MovementsPage />} />
                              <Route path="/estoque/requisicoes" element={<RequisitionsPage />} />
                              <Route
                                path="/estoque/inventario"
                                element={<PhysicalInventoryPage />}
                              />
                            </Route>

                            <Route element={<ProtectedRoute requiredPermission="view_financial" />}>
                              <Route path="/financeiro/dashboard" element={<FinanceDashboard />} />
                              <Route
                                path="/financeiro/contrato/:id"
                                element={<ContractFinanceDetail />}
                              />
                              <Route path="/financeiro/receitas" element={<RevenuesPage />} />
                              <Route path="/financeiro/compras" element={<PurchasesPage />} />
                              <Route path="/financeiro/custos" element={<CostsPage />} />
                              <Route
                                path="/financeiro/estoque"
                                element={<FinanceInventoryPage />}
                              />
                              <Route path="/financeiro/dre" element={<DREPage />} />
                              <Route path="/financeiro/fluxo-caixa" element={<CashFlowPage />} />
                              <Route path="/financeiro/tecnicos" element={<TechFinancePage />} />
                            </Route>

                            <Route element={<ProtectedRoute requiredPermission="manage_fleet" />}>
                              <Route path="/frotas/dashboard" element={<FleetDashboard />} />
                              <Route path="/veiculos" element={<VehiclesPage />} />
                              <Route path="/veiculos/:id" element={<VehicleDetailPage />} />
                              <Route path="/frotas/motoristas" element={<DriversPage />} />
                              <Route path="/frotas/manutencoes" element={<MaintenancePage />} />
                              <Route path="/frotas/abastecimentos" element={<RefuelingPage />} />
                              <Route path="/frotas/historico" element={<FleetHistoryPage />} />
                            </Route>

                            {/* Tech App specific endpoints */}
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
                        </Route>
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </TooltipProvider>
                  </BrowserRouter>
                </OperationalProvider>
              </InventoryProvider>
            </FleetProvider>
          </FinanceProvider>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
