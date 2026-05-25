import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import { AuthProvider } from './hooks/use-auth'
import { AuthProvider as StoreAuthProvider } from './stores/useAuthStore'
import { AppProvider } from './stores/useAppStore'
import { InventoryProvider } from './stores/useInventoryStore'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Index from './pages/Index'
import ContractsDashboard from './pages/admin/contracts/ContractsDashboard'
import ContractDetail from './pages/admin/contracts/ContractDetail'
import WorkOrderDetail from './pages/admin/WorkOrderDetail'
import ContractsMaintenance from './pages/admin/ContractsMaintenance'
import ContractsWorks from './pages/admin/ContractsWorks'
import MapPage from './pages/admin/MapPage'
import AuditPage from './pages/admin/AuditPage'
import SettingsPage from './pages/admin/SettingsPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'
import RecycleBinPage from './pages/admin/RecycleBinPage'
import NotFound from './pages/NotFound'

import CompaniesPage from './pages/admin/settings/CompaniesPage'
import ClientsPage from './pages/admin/settings/ClientsPage'
import UnitsPage from './pages/admin/settings/UnitsPage'
import SlaPage from './pages/admin/settings/SlaPage'
import ChecklistsPage from './pages/admin/settings/ChecklistsPage'
import UsersPage from './pages/admin/settings/UsersPage'
import TeamsPage from './pages/admin/settings/TeamsPage'
import TechniciansPage from './pages/admin/settings/TechniciansPage'
import ServiceCategoriesPage from './pages/admin/settings/ServiceCategoriesPage'
import ServiceTypesPage from './pages/admin/settings/ServiceTypesPage'
import PermissionsPage from './pages/admin/settings/PermissionsPage'
import SystemParametersPage from './pages/admin/settings/SystemParametersPage'

import MeasurementsPage from './pages/admin/measurements/MeasurementsPage'
import MeasurementDetailPage from './pages/admin/measurements/MeasurementDetailPage'
import ReportsPage from './pages/admin/ReportsPage'

// Estoque
import InventoryDashboard from './pages/admin/inventory/InventoryDashboard'
import ProductsPage from './pages/admin/inventory/ProductsPage'
import CentralWarehousePage from './pages/admin/inventory/CentralWarehousePage'
import VehicleStockPage from './pages/admin/inventory/VehicleStockPage'
import MovementsPage from './pages/admin/inventory/MovementsPage'
import TransfersPage from './pages/admin/inventory/TransfersPage'
import InboundsPage from './pages/admin/inventory/InboundsPage'
import OutboundsPage from './pages/admin/inventory/OutboundsPage'
import PhysicalInventoryPage from './pages/admin/inventory/PhysicalInventoryPage'
import SuppliersPage from './pages/admin/inventory/SuppliersPage'
import InventoryPurchasesPage from './pages/admin/inventory/PurchasesPage'

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

// Obras
import WorksDashboard from './pages/admin/obras/WorksDashboard'
import ProjectsRegistrationPage from './pages/admin/obras/ProjectsRegistrationPage'
import ProjectPlanningPage from './pages/admin/obras/ProjectPlanningPage'
import ProjectSchedulePage from './pages/admin/obras/ProjectSchedulePage'
import ProjectProgressPage from './pages/admin/obras/ProjectProgressPage'
import ProjectFinancePage from './pages/admin/obras/ProjectFinancePage'
import ProjectTeamsPage from './pages/admin/obras/ProjectTeamsPage'
import ProjectReportsPage from './pages/admin/obras/ProjectReportsPage'

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
import OpTechniciansPage from './pages/admin/operational/TechniciansPage'
import OpTeamsPage from './pages/admin/operational/TeamsPage'
import IndicatorsPage from './pages/admin/operational/IndicatorsPage'
import EventsPage from './pages/admin/operational/EventsPage'
import FeedbackPDIPage from './pages/admin/operational/FeedbackPDIPage'
import HistoryPage from './pages/admin/operational/HistoryPage'

// Tech Routes
import TechQueue from './pages/tech/TechQueue'
import TechExecution from './pages/tech/TechExecution'

const App = () => {
  return (
    <AuthProvider>
      <StoreAuthProvider>
        <AppProvider>
          <InventoryProvider>
            <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                      {/* Common Authenticated Routes */}
                      <Route path="/" element={<Navigate to="/contratos/painel" replace />} />
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/ordens" element={<Navigate to="/contratos/painel" replace />} />
                      <Route path="/contratos/painel" element={<ContractsDashboard />} />
                      <Route path="/contratos/:id" element={<ContractDetail />} />
                      <Route path="/ordens/:id" element={<WorkOrderDetail />} />
                      <Route path="/orders/:id" element={<WorkOrderDetail />} />
                      <Route path="/service-orders/:id" element={<WorkOrderDetail />} />
                      <Route path="/medicoes" element={<MeasurementsPage />} />
                      <Route path="/medicoes/:id" element={<MeasurementDetailPage />} />
                      <Route path="/relatorios" element={<ReportsPage />} />

                      <Route element={<ProtectedRoute requiredPermission="view_operational" />}>
                        <Route path="/mapa" element={<MapPage />} />
                        <Route path="/operacional/dashboard" element={<OpDashboard />} />
                        <Route path="/operacional/painel" element={<SupervisorPanelPage />} />
                        <Route path="/operacional/agenda" element={<OperationalAgendaPage />} />
                        <Route path="/operacional/tecnicos" element={<OpTechniciansPage />} />
                        <Route path="/operacional/equipes" element={<OpTeamsPage />} />
                        <Route path="/operacional/indicadores" element={<IndicatorsPage />} />
                        <Route path="/operacional/eventos" element={<EventsPage />} />
                        <Route path="/operacional/feedback" element={<FeedbackPDIPage />} />
                        <Route path="/operacional/historico" element={<HistoryPage />} />
                      </Route>

                      <Route element={<ProtectedRoute requiredPermission="manage_contracts" />}>
                        <Route path="/contratos/manutencao" element={<ContractsMaintenance />} />
                        <Route path="/contratos/obras" element={<ContractsWorks />} />
                      </Route>

                      <Route element={<ProtectedRoute requiredPermission="edit_service_order" />}>
                        <Route path="/auditoria" element={<AuditPage />} />
                      </Route>

                      <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
                        <Route
                          path="/settings"
                          element={<Navigate to="/settings/companies" replace />}
                        />
                        <Route path="/settings/companies" element={<CompaniesPage />} />
                        <Route path="/settings/users" element={<UsersPage />} />
                        <Route path="/settings/teams" element={<TeamsPage />} />
                        <Route path="/settings/technicians" element={<TechniciansPage />} />
                        <Route path="/settings/clients" element={<ClientsPage />} />
                        <Route path="/settings/sla" element={<SlaPage />} />
                        <Route path="/settings/checklists" element={<ChecklistsPage />} />
                        <Route
                          path="/settings/service-categories"
                          element={<ServiceCategoriesPage />}
                        />
                        <Route path="/settings/service-types" element={<ServiceTypesPage />} />
                        <Route path="/settings/permissions" element={<PermissionsPage />} />
                        <Route path="/settings/system" element={<SystemParametersPage />} />
                        <Route path="/settings/units" element={<UnitsPage />} />

                        <Route path="/logs-auditoria" element={<AuditLogsPage />} />
                        <Route path="/lixeira" element={<RecycleBinPage />} />
                      </Route>

                      <Route element={<ProtectedRoute requiredPermission="manage_stock" />}>
                        <Route path="/estoque/dashboard" element={<InventoryDashboard />} />
                        <Route path="/estoque/produtos" element={<ProductsPage />} />
                        <Route path="/estoque/almoxarifado" element={<CentralWarehousePage />} />
                        <Route path="/estoque/veiculos" element={<VehicleStockPage />} />
                        <Route path="/estoque/movimentacoes" element={<MovementsPage />} />
                        <Route path="/estoque/inventario" element={<PhysicalInventoryPage />} />
                        <Route path="/estoque/transferencias" element={<TransfersPage />} />
                        <Route path="/estoque/entradas" element={<InboundsPage />} />
                        <Route path="/estoque/saidas" element={<OutboundsPage />} />
                        <Route path="/estoque/fornecedores" element={<SuppliersPage />} />
                        <Route path="/estoque/compras" element={<InventoryPurchasesPage />} />
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
                        <Route path="/financeiro/estoque" element={<FinanceInventoryPage />} />
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

                      <Route>
                        <Route path="/obras/dashboard" element={<WorksDashboard />} />
                        <Route path="/obras/cadastro" element={<ProjectsRegistrationPage />} />
                        <Route path="/obras/planejamento" element={<ProjectPlanningPage />} />
                        <Route path="/obras/cronograma" element={<ProjectSchedulePage />} />
                        <Route path="/obras/progresso" element={<ProjectProgressPage />} />
                        <Route path="/obras/financeiro" element={<ProjectFinancePage />} />
                        <Route path="/obras/equipes" element={<ProjectTeamsPage />} />
                        <Route path="/obras/relatorios" element={<ProjectReportsPage />} />
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
          </InventoryProvider>
        </AppProvider>
      </StoreAuthProvider>
    </AuthProvider>
  )
}

export default App
