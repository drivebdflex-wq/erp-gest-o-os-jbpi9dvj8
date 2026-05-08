import { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import useInventoryStore from '@/stores/useInventoryStore'

export default function InventoryStateWrapper({ children }: { children: ReactNode }) {
  const { isLoading, error, fetchData } = useInventoryStore()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse mt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert
          variant="destructive"
          className="max-w-3xl mx-auto border-destructive/50 bg-destructive/5"
        >
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <AlertTitle className="text-lg font-semibold ml-2">Módulo Indisponível</AlertTitle>
          <AlertDescription className="mt-4 flex flex-col gap-4 ml-2">
            <p className="text-sm opacity-90 leading-relaxed">
              Não foi possível carregar os dados de estoque. Isso geralmente ocorre devido a uma
              tabela ausente ou falha de conexão com o Supabase.
            </p>
            <div className="bg-destructive/10 p-3 rounded-md text-xs font-mono break-words border border-destructive/20">
              <span className="font-semibold block mb-1">Detalhes do Diagnóstico:</span>
              {error}
            </div>
            <Button
              onClick={() => fetchData()}
              variant="outline"
              className="w-fit border-destructive/30 hover:bg-destructive/10 text-destructive mt-2"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
