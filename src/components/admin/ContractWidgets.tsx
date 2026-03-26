import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import { FileWarning, FileMinus, TrendingUp } from 'lucide-react'

export default function ContractWidgets() {
  const { contracts } = useAppStore()
  const now = new Date().getTime()

  const getDays = (dateStr?: string) => {
    if (!dateStr) return 999
    return (new Date(dateStr).getTime() - now) / (1000 * 60 * 60 * 24)
  }

  const expiringSoon = contracts.filter((c) => {
    const days = getDays(c.endDate)
    return days >= 0 && days <= 30
  })

  const expired = contracts.filter((c) => {
    const days = getDays(c.endDate)
    return days < 0
  })

  const upcomingAdjustments = contracts.filter((c) => {
    const days = getDays(c.nextAdjustmentDate)
    return days >= 0 && days <= 30
  })

  return (
    <div className="grid gap-4 md:grid-cols-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <Card className="border-warning/50 bg-warning/5 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-warning">
            Próximos do Vencimento (30d)
          </CardTitle>
          <FileWarning className="w-4 h-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{expiringSoon.length}</div>
          {expiringSoon.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              {expiringSoon.slice(0, 3).map((c) => (
                <p key={c.id} className="truncate font-medium">
                  {c.contractNumber} - {c.name}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-destructive">Contratos Vencidos</CardTitle>
          <FileMinus className="w-4 h-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{expired.length}</div>
          {expired.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              {expired.slice(0, 3).map((c) => (
                <p key={c.id} className="truncate font-medium">
                  {c.contractNumber} - {c.name}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-500/50 bg-blue-500/5 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Próximos Reajustes (30d)
          </CardTitle>
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {upcomingAdjustments.length}
          </div>
          {upcomingAdjustments.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              {upcomingAdjustments.slice(0, 3).map((c) => (
                <p key={c.id} className="truncate font-medium">
                  {c.contractNumber} - {c.name}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
