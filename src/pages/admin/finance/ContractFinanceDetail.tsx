import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import useAppStore from '@/stores/useAppStore'
import useFinanceStore from '@/stores/useFinanceStore'
import FinanceNav from '@/components/admin/finance/FinanceNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Target,
  OctagonAlert,
  PieChart,
  Activity,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

export default function ContractFinanceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { contracts } = useAppStore()
  const { revenues, costs } = useFinanceStore()

  const [periodFilter, setPeriodFilter] = useState('total')
  const [typeFilter, setTypeFilter] = useState('all')

  const contract = contracts.find((c) => c.id === id)

  const rawRevs = useMemo(
    () => revenues.filter((r) => r.contractId === id && r.status === 'recebido'),
    [revenues, id],
  )
  const rawCosts = useMemo(
    () => costs.filter((c) => c.contractId === id && new Date(c.date) <= new Date()),
    [costs, id],
  )

  const filteredRevs = useMemo(() => {
    return rawRevs.filter((r) => {
      if (periodFilter === 'total') return true
      const date = new Date(r.date)
      const now = new Date()
      if (periodFilter === 'month')
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      if (periodFilter === 'quarter') {
        const q = Math.floor(now.getMonth() / 3)
        const rQ = Math.floor(date.getMonth() / 3)
        return q === rQ && date.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [rawRevs, periodFilter])

  const filteredCosts = useMemo(() => {
    return rawCosts.filter((c) => {
      if (periodFilter === 'total') return true
      const date = new Date(c.date)
      const now = new Date()
      if (periodFilter === 'month')
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      if (periodFilter === 'quarter') {
        const q = Math.floor(now.getMonth() / 3)
        const rQ = Math.floor(date.getMonth() / 3)
        return q === rQ && date.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [rawCosts, periodFilter])

  const totalRev = filteredRevs.reduce((s, r) => s + r.value, 0)
  const totalCost = filteredCosts.reduce((s, c) => s + c.value, 0)
  const profit = totalRev - totalCost
  const margin = totalRev > 0 ? (profit / totalRev) * 100 : 0

  const fixedRevs = filteredRevs
    .filter((r) => r.isFixed || r.type === 'mensal')
    .reduce((s, r) => s + r.value, 0)
  const varRevs = totalRev - fixedRevs

  const costByCategory = filteredCosts.reduce(
    (acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + c.value
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = useMemo(() => {
    const periods: Record<string, { in: number; out: number }> = {}
    const allData = [
      ...rawRevs.map((r) => ({ d: r.date, val: r.value, type: 'in' })),
      ...rawCosts.map((c) => ({ d: c.date, val: c.value, type: 'out' })),
    ]

    allData.forEach((item) => {
      const key = item.d.substring(0, 7) // YYYY-MM
      if (!periods[key]) periods[key] = { in: 0, out: 0 }
      if (item.type === 'in') periods[key].in += item.val
      else periods[key].out += item.val
    })

    return Object.keys(periods)
      .sort()
      .map((k) => ({
        name: k,
        Receita: periods[k].in,
        Despesa: periods[k].out,
      }))
  }, [rawRevs, rawCosts])

  const statement = useMemo(() => {
    const combined = [
      ...filteredRevs.map((r) => ({
        id: r.id,
        date: r.date,
        kind: 'revenue' as const,
        category: r.type,
        value: r.value,
        origin: 'manual',
      })),
      ...filteredCosts.map((c) => ({
        id: c.id,
        date: c.date,
        kind: 'expense' as const,
        category: c.category,
        value: c.value,
        origin: c.origin || 'manual',
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (typeFilter !== 'all') {
      return combined.filter((s) => s.kind === typeFilter)
    }
    return combined
  }, [filteredRevs, filteredCosts, typeFilter])

  if (!contract) {
    return <div className="p-8 text-center text-muted-foreground">Contrato não encontrado.</div>
  }

  const budgetTotal =
    (contract.budgetLabor || 0) +
    (contract.budgetMaterial || 0) +
    (contract.budgetFuel || 0) +
    (contract.budgetOthers || 0)

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <FinanceNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/financeiro/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{contract.name}</h2>
            <p className="text-sm text-muted-foreground">
              Análise Financeira Detalhada do Contrato
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Todo o Histórico</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {profit < 0 && (
          <Badge variant="destructive" className="px-3 py-1.5 text-sm gap-2">
            <OctagonAlert className="w-4 h-4" /> Prejuízo Registrado
          </Badge>
        )}
        {margin > 0 && margin < 10 && (
          <Badge
            variant="secondary"
            className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1.5 text-sm gap-2"
          >
            <AlertTriangle className="w-4 h-4" /> Margem de Alerta ({margin.toFixed(1)}%)
          </Badge>
        )}
        {budgetTotal > 0 && totalCost > budgetTotal && (
          <Badge variant="destructive" className="px-3 py-1.5 text-sm gap-2">
            <TrendingDown className="w-4 h-4" /> Custo Acima do Orçamento (Orçado: R${' '}
            {budgetTotal.toFixed(2)})
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {totalRev.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}
            >
              R$ {profit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margem %</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{margin.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Receita vs Despesa</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  Receita: { label: 'Receita', color: 'hsl(var(--success))' },
                  Despesa: { label: 'Despesa', color: 'hsl(var(--destructive))' },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="Receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Extrato Detalhado (Statement)</CardTitle>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filtro Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Mov.</SelectItem>
                  <SelectItem value="revenue">Apenas Receitas</SelectItem>
                  <SelectItem value="expense">Apenas Despesas</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statement.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={s.kind === 'revenue' ? 'outline' : 'secondary'}
                          className={
                            s.kind === 'revenue'
                              ? 'text-success border-success/30'
                              : 'text-destructive'
                          }
                        >
                          {s.kind === 'revenue' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{s.category.replace('_', ' ')}</TableCell>
                      <TableCell className="capitalize">{s.origin}</TableCell>
                      <TableCell
                        className={`text-right font-mono ${s.kind === 'revenue' ? 'text-success' : 'text-destructive'}`}
                      >
                        {s.kind === 'revenue' ? '+' : '-'} R$ {s.value.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {statement.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        Nenhuma movimentação encontrada neste período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Composição de Receitas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Receitas Fixas (Mensais)</span>
                <span className="font-bold text-success">R$ {fixedRevs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Receitas Variáveis (Medições/Extras)</span>
                <span className="font-bold text-primary">R$ {varRevs.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Composição de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { k: 'mão de obra', l: 'Mão de Obra' },
                { k: 'material_os', l: 'Material / OS' },
                { k: 'combustível', l: 'Combustível' },
                { k: 'terceirizado', l: 'Terceirizados' },
                { k: 'equipamento', l: 'Equipamentos' },
                { k: 'administrativo', l: 'Administrativo' },
                { k: 'outros', l: 'Outros' },
              ].map((c) => {
                const val = costByCategory[c.k] || 0
                if (val === 0) return null
                return (
                  <div
                    key={c.k}
                    className="flex justify-between items-center border-b pb-2 last:border-0"
                  >
                    <span className="text-sm font-medium">{c.l}</span>
                    <span className="font-bold text-destructive">R$ {val.toFixed(2)}</span>
                  </div>
                )
              })}
              {Object.keys(costByCategory).length === 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  Nenhuma despesa registrada.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
