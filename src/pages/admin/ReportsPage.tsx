import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Relatórios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Módulo em desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A seção de relatórios customizados estará disponível em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
