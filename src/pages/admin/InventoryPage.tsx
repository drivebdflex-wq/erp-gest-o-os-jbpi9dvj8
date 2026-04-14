import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const inventory = [
  {
    id: 'MAT-001',
    name: 'Roteador Wi-Fi AC1200',
    type: 'Equipamento',
    stock: 45,
    min: 20,
    location: 'Almoxarifado Central',
  },
  {
    id: 'MAT-002',
    name: 'Cabo UTP Cat6 (Caixa 300m)',
    type: 'Consumível',
    stock: 8,
    min: 10,
    location: 'Almoxarifado Central',
  },
  {
    id: 'MAT-003',
    name: 'Conector RJ45',
    type: 'Consumível',
    stock: 1250,
    min: 500,
    location: 'Carro T-04 (Carlos)',
  },
  {
    id: 'MAT-004',
    name: 'Alicate de Crimpagem',
    type: 'Ferramenta',
    stock: 2,
    min: 5,
    location: 'Almoxarifado Central',
  },
]

export default function InventoryPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Estoque e Materiais</h2>
        <p className="text-sm text-muted-foreground">Controle de saldo central e volantes.</p>
      </div>

      <div className="rounded-md border bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="text-right">Saldo Atual</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-xs">{item.id}</TableCell>
                <TableCell className="font-semibold">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.location}</TableCell>
                <TableCell className="text-right font-mono">{item.stock}</TableCell>
                <TableCell>
                  {item.stock <= item.min ? (
                    <Badge variant="destructive" className="animate-pulse">
                      Baixo
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-success/20 text-success hover:bg-success/30"
                    >
                      Normal
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
