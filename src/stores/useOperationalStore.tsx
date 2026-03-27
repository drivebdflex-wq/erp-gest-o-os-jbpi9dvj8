import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface OpTechnician {
  id: string
  name: string
  phone: string
  role: string
  level: 'junior' | 'pleno' | 'senior'
  status: 'active' | 'inactive'
  salary_type?: 'mensal' | 'diária' | 'hora'
  salary_amount?: number
  cost_per_hour?: number
}

export interface OpTeam {
  id: string
  name: string
  supervisor_id: string
  members: string[]
  start_date: string
  end_date?: string
  active?: boolean
}

export interface OpEvent {
  id: string
  technician_id: string
  type: 'falta' | 'advertência' | 'suspensão' | 'reunião' | 'alinhamento'
  description: string
  date: string
  created_by: string
}

export interface OpFeedback {
  id: string
  technician_id: string
  rating: number
  comment: string
  date: string
}

export interface OpPDI {
  id: string
  technician_id: string
  goal: string
  action: string
  deadline: string
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
}

export interface OpHistory {
  id: string
  technician_id: string
  action: string
  details: string
  date: string
}

interface OperationalState {
  technicians: OpTechnician[]
  teams: OpTeam[]
  events: OpEvent[]
  feedbacks: OpFeedback[]
  pdis: OpPDI[]
  historyLogs: OpHistory[]

  addTechnician: (t: Omit<OpTechnician, 'id'>) => void
  updateTechnician: (id: string, t: Partial<OpTechnician>) => void
  addTeam: (t: Omit<OpTeam, 'id'>) => void
  updateTeam: (id: string, t: Partial<OpTeam>) => void
  addEvent: (e: Omit<OpEvent, 'id'>) => void
  addFeedback: (f: Omit<OpFeedback, 'id'>) => void
  addPDI: (p: Omit<OpPDI, 'id'>) => void
  updatePDI: (id: string, p: Partial<OpPDI>) => void
}

const OperationalContext = createContext<OperationalState | undefined>(undefined)

export function OperationalProvider({ children }: { children: ReactNode }) {
  const [technicians, setTechnicians] = useState<OpTechnician[]>([
    {
      id: 'tech-record-1',
      name: 'Carlos Silva',
      phone: '(11) 99999-9999',
      role: 'Técnico Sênior',
      level: 'senior',
      status: 'active',
      salary_type: 'mensal',
      salary_amount: 5000,
      cost_per_hour: 22.72,
    },
    {
      id: 't2',
      name: 'João Mendes',
      phone: '(11) 98888-8888',
      role: 'Eletricista',
      level: 'pleno',
      status: 'active',
      salary_type: 'hora',
      salary_amount: 35,
      cost_per_hour: 35,
    },
    {
      id: 't3',
      name: 'Ana Oliveira',
      phone: '(11) 97777-7777',
      role: 'Técnico de Redes',
      level: 'junior',
      status: 'inactive',
    },
  ])

  const [teams, setTeams] = useState<OpTeam[]>([
    {
      id: 'team-alpha',
      name: 'Equipe Alpha',
      supervisor_id: 'tech-record-1',
      members: ['tech-record-1', 't2'],
      start_date: '2023-01-01',
      active: true,
    },
  ])

  const [events, setEvents] = useState<OpEvent[]>([])
  const [feedbacks, setFeedbacks] = useState<OpFeedback[]>([])
  const [pdis, setPdis] = useState<OpPDI[]>([])
  const [historyLogs, setHistoryLogs] = useState<OpHistory[]>([])

  const addLog = useCallback((technician_id: string, action: string, details: string) => {
    setHistoryLogs((prev) => [
      {
        id: Math.random().toString(),
        technician_id,
        action,
        details,
        date: new Date().toISOString(),
      },
      ...prev,
    ])
  }, [])

  const addTechnician = useCallback(
    (t: Omit<OpTechnician, 'id'>) => {
      const id = Math.random().toString()
      setTechnicians((prev) => [...prev, { ...t, id }])
      addLog(id, 'Criação', 'Técnico cadastrado no sistema')
    },
    [addLog],
  )

  const updateTechnician = useCallback(
    (id: string, t: Partial<OpTechnician>) => {
      setTechnicians((prev) => prev.map((x) => (x.id === id ? { ...x, ...t } : x)))
      addLog(id, 'Atualização', 'Dados do técnico atualizados')
    },
    [addLog],
  )

  const addTeam = useCallback(
    (t: Omit<OpTeam, 'id'>) => {
      const id = Math.random().toString()
      setTeams((prev) => [...prev, { ...t, id }])
      t.members.forEach((m) => addLog(m, 'Equipe', `Adicionado à equipe ${t.name}`))
    },
    [addLog],
  )

  const updateTeam = useCallback(
    (id: string, t: Partial<OpTeam>) => {
      setTeams((prev) => prev.map((x) => (x.id === id ? { ...x, ...t } : x)))
      if (t.members) t.members.forEach((m) => addLog(m, 'Equipe', `Movimentação na equipe`))
    },
    [addLog],
  )

  const addEvent = useCallback(
    (e: Omit<OpEvent, 'id'>) => {
      const id = Math.random().toString()
      setEvents((prev) => [...prev, { ...e, id }])
      addLog(e.technician_id, 'Evento/Disciplina', `Registro de ${e.type}: ${e.description}`)
    },
    [addLog],
  )

  const addFeedback = useCallback(
    (f: Omit<OpFeedback, 'id'>) => {
      const id = Math.random().toString()
      setFeedbacks((prev) => [...prev, { ...f, id }])
      addLog(f.technician_id, 'Feedback', `Novo feedback recebido`)
    },
    [addLog],
  )

  const addPDI = useCallback(
    (p: Omit<OpPDI, 'id'>) => {
      const id = Math.random().toString()
      setPdis((prev) => [...prev, { ...p, id }])
      addLog(p.technician_id, 'PDI', `Novo PDI criado`)
    },
    [addLog],
  )

  const updatePDI = useCallback((id: string, p: Partial<OpPDI>) => {
    setPdis((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))
  }, [])

  return (
    <OperationalContext.Provider
      value={{
        technicians,
        teams,
        events,
        feedbacks,
        pdis,
        historyLogs,
        addTechnician,
        updateTechnician,
        addTeam,
        updateTeam,
        addEvent,
        addFeedback,
        addPDI,
        updatePDI,
      }}
    >
      {children}
    </OperationalContext.Provider>
  )
}

export default function useOperationalStore() {
  const context = useContext(OperationalContext)
  if (!context) throw new Error('useOperationalStore must be used within OperationalProvider')
  return context
}
