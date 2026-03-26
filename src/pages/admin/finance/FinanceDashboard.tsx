import useFinanceStore from '@/stores/useFinanceStore'
import useAppStore from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

export default function FinanceDashboard() {
  const { contracts } = useAppStore()
  const { revenues, costs } = useFinanceStore()

  const data = contracts.map((contract) => {
    const totalRev = revenues
      .filter((r) => r.contractId === contract.id)
      .reduce((sum, r) => sum + r.value, 0)
    const totalCost = costs
      .filter((c) => c.contractId === contract.id)
      .reduce((sum, c) => sum + c.value, 0)
    const profit = totalRev - totalCost
    const margin = totalRev > 0 ? (profit / totalRev) * 100 : 0
    return { ...contract, totalRev, totalCost, profit, margin }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Financeiro</h2>
        <p className="text-sm text-muted-foreground">
          Visão de rentabilidade e margem operacional por contrato.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((d) => {
          const hasLoss = d.profit < 0
          const costOverRevenue = d.totalCost > d.totalRev

          return (
            <Card
              key={d.id}
              className={`overflow-hidden transition-all ${hasLoss ? 'border-destructive/50 ring-1 ring-destructive/20 shadow-sm shadow-destructive/10' : ''}`}
            >
              <div className={`h-1 w-full ${hasLoss ? 'bg-destructive' : 'bg-success'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold line-clamp-1" title={d.name}>
                    {d.name}
                  </CardTitle>
                  {hasLoss ? (
                    <Badge variant="destructive" className="ml-2 shrink-0">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Prejuízo
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/20 ml-2 shrink-0"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" /> Saudável
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {d.clientName || 'Cliente Indefinido'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Receita Total</span>
                    <p className="font-mono font-medium">R$ {d.totalRev.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Custo Total</span>
                    <p
                      className={`font-mono font-medium ${costOverRevenue ? 'text-destructive font-bold' : ''}`}
                    >
                      R$ {d.totalCost.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Lucro</span>
                    <span
                      className={`text-lg font-bold ${hasLoss ? 'text-destructive' : 'text-success'} flex items-center`}
                    >
                      {hasLoss ? (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      )}
                      R$ {Math.abs(d.profit).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Margem</span>
                    <span className="text-lg font-bold">{d.margin.toFixed(1)}%</span>
                  </div>
                </div>

                {costOverRevenue && (
                  <div className="bg-destructive/10 text-destructive text-xs p-2 rounded flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Atenção: Os custos superaram as receitas.
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
