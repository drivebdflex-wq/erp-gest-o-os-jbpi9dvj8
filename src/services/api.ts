import { buildApiUrl } from '@/config/api'

export const api = {
  serviceOrders: {
    list: async () => {
      const res = await fetch(buildApiUrl('/service-orders'))
      if (!res.ok) throw new Error('Failed to fetch service orders')
      return res.json()
    },
    create: async (data: any) => {
      const res = await fetch(buildApiUrl('/service-orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create service order')
      return res.json()
    },
    updateStatus: async (id: string, status: string) => {
      const res = await fetch(buildApiUrl(`/service-orders/${id}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update service order status')
      return res.json()
    },
  },
  clients: {
    list: async () => {
      const res = await fetch(buildApiUrl('/clients'))
      if (!res.ok) throw new Error('Failed to fetch clients')
      return res.json()
    },
    create: async (data: any) => {
      const res = await fetch(buildApiUrl('/clients'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create client')
      return res.json()
    },
  },
}
