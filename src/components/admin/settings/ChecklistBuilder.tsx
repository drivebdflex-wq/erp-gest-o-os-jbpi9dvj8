import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListChecks, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type FieldType = 'short_text' | 'long_text' | 'number' | 'photo' | 'signature'

interface ChecklistField {
  id: string
  type: FieldType
  label: string
  required: boolean
}

export default function ChecklistBuilder() {
  const [title, setTitle] = useState('Checklist Manutenção Padrão')
  const [fields, setFields] = useState<ChecklistField[]>([
    { id: '1', type: 'short_text', label: 'Nome do Responsável no Local', required: true },
    { id: '2', type: 'photo', label: 'Foto do Equipamento ANTES', required: true },
    { id: '3', type: 'number', label: 'Tensão Medida (V)', required: false },
  ])

  const addField = () => {
    const newField: ChecklistField = {
      id: Math.random().toString(36).substring(7),
      type: 'short_text',
      label: 'Novo Campo',
      required: false,
    }
    setFields([...fields, newField])
  }

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const updateField = (id: string, key: keyof ChecklistField, value: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)))
  }

  const handleSave = () => {
    toast({
      title: 'Template Salvo',
      description: `O template "${title}" foi salvo com ${fields.length} campos.`,
    })
  }

  return (
    <Card className="flex flex-col min-h-[500px]">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Construtor de Checklist
            </CardTitle>
            <CardDescription className="mt-1">
              Crie templates dinâmicos para uso no aplicativo mobile dos técnicos.
            </CardDescription>
          </div>
          <Button onClick={handleSave}>Salvar Template</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 space-y-6 bg-secondary/10">
        <div className="grid gap-2 bg-background p-4 rounded-lg border shadow-sm">
          <Label htmlFor="templateTitle" className="text-base font-semibold">
            Título do Template
          </Label>
          <Input
            id="templateTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Campos Dinâmicos
            </h3>
            <Button variant="outline" size="sm" onClick={addField}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar Campo
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-4 bg-background p-4 rounded-lg border shadow-sm group animate-fade-in"
              >
                <div className="mt-2 text-muted-foreground cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 opacity-50 group-hover:opacity-100" />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="col-span-1 md:col-span-5 grid gap-2">
                    <Label className="text-xs">Rótulo / Pergunta</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, 'label', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-4 grid gap-2">
                    <Label className="text-xs">Tipo de Campo</Label>
                    <Select
                      value={field.type}
                      onValueChange={(val) => updateField(field.id, 'type', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short_text">Texto Curto</SelectItem>
                        <SelectItem value="long_text">Texto Longo</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="photo">Foto / Evidência</SelectItem>
                        <SelectItem value="signature">Assinatura Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex flex-col justify-center gap-2">
                    <Label className="text-xs text-center">Obrigatório?</Label>
                    <div className="flex justify-center">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(val) => updateField(field.id, 'required', val)}
                      />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 flex items-end justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-background">
                Nenhum campo adicionado. Clique em "Adicionar Campo" para começar.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
