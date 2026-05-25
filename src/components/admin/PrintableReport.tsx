import { useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'

export default function PrintableReport() {
  const { filteredOrders: orders, filters } = useAppStore()

  const kpis = useMemo(() => {
    let within = 0,
      warning = 0,
      breached = 0
    let totalTime = 0
    let completedCount = 0

    orders.forEach((o) => {
      if (!['Finalizada', 'Cancelada', 'Rejeitada'].includes(o.status)) {
        if (o.slaStatus === 'breached') breached++
        else if (o.slaStatus === 'warning') warning++
        else within++
      }
      if (o.status === 'Finalizada') {
        completedCount++
        totalTime += o.totalDuration || 0
      }
    })

    return {
      total: orders.length,
      active: within + warning + breached,
      within,
      warning,
      breached,
      avgTime: completedCount > 0 ? Math.round(totalTime / completedCount) : 0,
    }
  }, [orders])

  const techStats = useMemo(() => {
    const stats: Record<string, { total: number; withinSla: number; duration: number }> = {}
    const completed = orders.filter((o) => o.status === 'Finalizada')

    completed.forEach((o) => {
      if (!stats[o.tech]) stats[o.tech] = { total: 0, withinSla: 0, duration: 0 }
      stats[o.tech].total += 1
      if (o.slaStatus === 'within_sla') stats[o.tech].withinSla += 1
      stats[o.tech].duration += o.totalDuration || 0
    })

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        total: data.total,
        avgDuration: Math.round(data.duration / data.total),
        slaPercent: Math.round((data.withinSla / data.total) * 100),
      }))
      .sort((a, b) => b.slaPercent - a.slaPercent || b.total - a.total)
  }, [orders])

  return (
    <div className="hidden print:block w-full max-w-[210mm] mx-auto bg-white text-black p-8 font-sans">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          aside, header, nav { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; overflow: visible !important; }
          .print-break-inside-avoid { break-inside: avoid; }
        }
      `}</style>

      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
            FieldOps Pro
          </h1>
          <h2 className="text-lg text-slate-600 mt-1">Relatório Operacional</h2>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>
            Gerado em: {new Date().toLocaleDateString('pt-BR')}{' '}
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Filters Context */}
      <div className="mb-6 bg-slate-50 p-4 border border-slate-200 rounded grid grid-cols-4 gap-4 print-break-inside-avoid">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Cliente</p>
          <p className="text-sm font-medium">
            {filters.client === 'all' ? 'Todos os Clientes' : filters.client}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Unidade</p>
          <p className="text-sm font-medium">{filters.unit === 'all' ? 'Todas' : filters.unit}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Tipo de Serviço</p>
          <p className="text-sm font-medium">{filters.type === 'all' ? 'Todos' : filters.type}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Período</p>
          <p className="text-sm font-medium">
            {filters.period === 'all' ? 'Todo o Período' : filters.period}
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-8 print-break-inside-avoid">
        <h3 className="text-base font-bold uppercase text-slate-800 mb-3 border-b border-slate-200 pb-1">
          Resumo Executivo
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-slate-200 p-4 rounded text-center bg-slate-50">
            <p className="text-sm text-slate-500 font-semibold">Total de Ordens (Filtradas)</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{kpis.total}</p>
          </div>
          <div className="border border-slate-200 p-4 rounded text-center bg-slate-50">
            <p className="text-sm text-slate-500 font-semibold">Tempo Médio (Concluídas)</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">
              {kpis.avgTime} <span className="text-lg font-normal text-slate-500">min</span>
            </p>
          </div>
          <div className="border border-slate-200 p-4 rounded text-center bg-slate-50 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-semibold mb-2">Distribuição SLA (Ativas)</p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex flex-col items-center">
                <span className="font-bold text-green-600 text-lg">{kpis.within}</span>
                <span>No Prazo</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-yellow-600 text-lg">{kpis.warning}</span>
                <span>Risco</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-red-600 text-lg">{kpis.breached}</span>
                <span>Atrasadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Ranking */}
      {techStats.length > 0 && (
        <div className="mb-8 print-break-inside-avoid">
          <h3 className="text-base font-bold uppercase text-slate-800 mb-3 border-b border-slate-200 pb-1">
            Desempenho por Técnico
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-left">Técnico</th>
                <th className="border border-slate-300 p-2 text-center">OS Concluídas</th>
                <th className="border border-slate-300 p-2 text-center">Tempo Médio (min)</th>
                <th className="border border-slate-300 p-2 text-center">SLA no Prazo</th>
              </tr>
            </thead>
            <tbody>
              {techStats.map((tech) => (
                <tr key={tech.name}>
                  <td className="border border-slate-300 p-2">{tech.name}</td>
                  <td className="border border-slate-300 p-2 text-center">{tech.total}</td>
                  <td className="border border-slate-300 p-2 text-center">{tech.avgDuration}</td>
                  <td className="border border-slate-300 p-2 text-center font-medium">
                    {tech.slaPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed OS List */}
      <div>
        <h3 className="text-base font-bold uppercase text-slate-800 mb-3 border-b border-slate-200 pb-1">
          Detalhamento de Ordens de Serviço
        </h3>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-2 text-left w-[80px]">ID</th>
              <th className="border border-slate-300 p-2 text-left">Título / Tipo</th>
              <th className="border border-slate-300 p-2 text-left">Cliente / Unidade</th>
              <th className="border border-slate-300 p-2 text-left">Técnico</th>
              <th className="border border-slate-300 p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="print-break-inside-avoid">
                <td className="border border-slate-300 p-2 font-mono text-slate-500">
                  {order.shortId}
                </td>
                <td className="border border-slate-300 p-2">
                  <div className="font-semibold text-slate-800">{order.title}</div>
                  <div className="text-slate-500">{order.type}</div>
                </td>
                <td className="border border-slate-300 p-2">
                  <div className="font-medium text-slate-800">{order.client}</div>
                  <div className="text-slate-500">{order.unit}</div>
                </td>
                <td className="border border-slate-300 p-2">{order.tech}</td>
                <td className="border border-slate-300 p-2 text-center font-medium">
                  {order.status}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="border border-slate-300 p-4 text-center text-slate-500">
                  Nenhuma ordem encontrada para os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
