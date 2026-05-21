import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Building2,
  Users,
  MapPin,
  ShieldCheck,
  HardHat,
  Briefcase,
  Clock,
  Layers,
  Wrench,
  CheckSquare,
  Plug,
  Sliders,
} from 'lucide-react'

export default function SettingsDashboard() {
  const cards = [
    {
      title: 'Empresas',
      description: 'Prestadores de serviços',
      icon: Building2,
      link: '/configs/master?tab=companies',
    },
    {
      title: 'Clientes',
      description: 'Gestão de clientes corporativos',
      icon: Briefcase,
      link: '/configs/clientes',
    },
    {
      title: 'Unidades',
      description: 'Locais físicos vinculados a clientes',
      icon: MapPin,
      link: '/configs/unidades',
    },
    { title: 'SLA', description: 'Níveis de acordo de serviço', icon: Clock, link: '/configs/sla' },
    {
      title: 'Categorias de Serviço',
      description: 'Classificação geral',
      icon: Layers,
      link: '/configs/master?tab=categories',
    },
    {
      title: 'Tipos de Atendimento',
      description: 'Preventiva, Corretiva, etc.',
      icon: Wrench,
      link: '/configs/master?tab=types',
    },
    {
      title: 'Checklists',
      description: 'Modelos de verificação técnica',
      icon: CheckSquare,
      link: '/configs/checklists',
    },
    { title: 'Usuários', description: 'Acessos ao sistema', icon: Users, link: '/configs/antigo' },
    {
      title: 'Técnicos',
      description: 'Efetivo operacional',
      icon: HardHat,
      link: '/operacional/tecnicos',
    },
    {
      title: 'Equipes',
      description: 'Agrupamento de técnicos',
      icon: Users,
      link: '/operacional/equipes',
    },
    {
      title: 'Perfis e Permissões',
      description: 'Controle de acesso (RBAC)',
      icon: ShieldCheck,
      link: '/configs/antigo',
    },
    {
      title: 'Integrações',
      description: 'Webhooks e APIs externas',
      icon: Plug,
      link: '/configs/antigo',
    },
    {
      title: 'Parâmetros do Sistema',
      description: 'Ajustes globais do ERP',
      icon: Sliders,
      link: '/configs/master?tab=params',
    },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Painel de Configurações</h1>
        <p className="text-muted-foreground">
          Gestão centralizada de dados mestres: Cliente → Unidade → Contrato → SLA → OS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <Link
              key={i}
              to={card.link}
              className="block transition-transform hover:-translate-y-1"
            >
              <Card className="h-full hover:border-primary/50 transition-colors shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{card.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
