import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProjectTeamsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Equipes de Obra</h2>
      <Card>
        <CardHeader>
          <CardTitle>Em Construção</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Módulo de alocação de equipes será disponibilizado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
