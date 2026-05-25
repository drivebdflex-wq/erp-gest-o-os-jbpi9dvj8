import { Order } from '@/stores/useAppStore'

export function exportOrdersToCSV(orders: Order[]) {
  const headers = [
    'ID',
    'Short ID',
    'Título',
    'Cliente',
    'Unidade',
    'Status',
    'Prioridade',
    'Técnico',
    'Tipo',
    'Data',
    'SLA',
    'Duração (min)',
  ]

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === null || str === undefined) return '""'
    const stringified = String(str)
    if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
      return `"${stringified.replace(/"/g, '""')}"`
    }
    return stringified
  }

  const rows = orders.map((o) => [
    escapeCSV(o.id),
    escapeCSV(o.shortId),
    escapeCSV(o.title),
    escapeCSV(o.client),
    escapeCSV(o.unit),
    escapeCSV(o.status),
    escapeCSV(o.priority),
    escapeCSV(o.tech),
    escapeCSV(o.type),
    escapeCSV(o.date),
    escapeCSV(o.slaStatus),
    escapeCSV(o.totalDuration),
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  // Add BOM for Excel UTF-8 compatibility
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `relatorio_operacional_fieldops_${new Date().toISOString().split('T')[0]}.csv`,
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
