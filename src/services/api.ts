import { buildApiUrl } from '@/config/api'

export const api = {
  serviceOrders: {
    list: async () => {
      const res = await fetch(buildApiUrl('/service-orders'))
      if (!res.ok) throw new Error('Failed to fetch service orders')
      return res.json()
    },
    create: async (data: any) => {
      const isUUID = (str: string) => {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return regex.test(str)
      }

      let priority = data.priority
      if (priority === 'Normal (10 dias)' || priority === 'Normal') priority = 'medium'
      else if (priority === 'Alta') priority = 'high'
      else if (priority === 'Baixa') priority = 'low'
      else if (priority === 'Urgente') priority = 'urgent'
      else if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority))
        priority = 'medium'

      let status = data.status || 'pending'
      if (status === 'scheduled') status = 'pending'
      if (!['pending', 'in_progress', 'completed'].includes(status)) {
        status = 'pending'
      }

      const payload = { ...data, priority, status }

      if (!payload.team_id || !isUUID(String(payload.team_id))) {
        delete payload.team_id
      }

      if (!payload.technician_id || !isUUID(String(payload.technician_id))) {
        delete payload.technician_id
      }

      const res = await fetch(buildApiUrl('/service-orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let errorMsg = 'Failed to create service order'
        try {
          const errBody = await res.json()
          if (errBody.message) errorMsg = errBody.message
          else if (errBody.error) errorMsg = errBody.error
        } catch (e) {}
        throw new Error(errorMsg)
      }
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
