import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Building2, Clock, Key, ListChecks } from 'lucide-react'

// Settings Components
import UsersSettings from '@/components/admin/settings/UsersSettings'
import CompanySettings from '@/components/admin/settings/CompanySettings'
import SLASettings from '@/components/admin/settings/SLASettings'
import IntegrationSettings from '@/components/admin/settings/IntegrationSettings'
import ChecklistBuilder from '@/components/admin/settings/ChecklistBuilder'

export default function SettingsPage() {
  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie usuários, políticas de SLA, integrações e templates.
        </p>
      </div>

      <Tabs defaultValue="users" className="flex-1 flex flex-col lg:flex-row gap-6">
        <TabsList className="flex lg:flex-col justify-start h-auto w-full lg:w-48 bg-transparent p-0 overflow-x-auto overflow-y-hidden lg:overflow-visible no-scrollbar">
          <TabsTrigger
            value="users"
            className="justify-start gap-2 px-4 py-2 w-full data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
          >
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger
            value="company"
            className="justify-start gap-2 px-4 py-2 w-full data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
          >
            <Building2 className="h-4 w-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger
            value="sla"
            className="justify-start gap-2 px-4 py-2 w-full data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
          >
            <Clock className="h-4 w-4" /> Políticas SLA
          </TabsTrigger>
          <TabsTrigger
            value="checklists"
            className="justify-start gap-2 px-4 py-2 w-full data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
          >
            <ListChecks className="h-4 w-4" /> Checklists
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="justify-start gap-2 px-4 py-2 w-full data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
          >
            <Key className="h-4 w-4" /> Integrações
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto pb-8">
          <TabsContent value="users" className="m-0 border-none p-0 outline-none">
            <UsersSettings />
          </TabsContent>
          <TabsContent value="company" className="m-0 border-none p-0 outline-none">
            <CompanySettings />
          </TabsContent>
          <TabsContent value="sla" className="m-0 border-none p-0 outline-none">
            <SLASettings />
          </TabsContent>
          <TabsContent value="checklists" className="m-0 border-none p-0 outline-none">
            <ChecklistBuilder />
          </TabsContent>
          <TabsContent value="integrations" className="m-0 border-none p-0 outline-none">
            <IntegrationSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
