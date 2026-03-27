import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface OpTechnician {
  id: string
  name: string
  phone: string
  role: string
  level: 'junior' | 'pleno' | 'senior'
  status: 'active' | 'inactive'
}

export interface OpTeam {
  id: string
  name: string
  supervisor_id: string
  members: string[]
  start_date: string
  end_date?: string
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
      id: 't1',
      name: 'Carlos Silva',
      phone: '(11) 99999-9999',
      role: 'Técnico Sênior',
      level: 'senior',
      status: 'active',
    },
    {
      id: 't2',
      name: 'João Mendes',
      phone: '(11) 98888-8888',
      role: 'Eletricista',
      level: 'pleno',
      status: 'active',
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
      id: 'tm1',
      name: 'Equipe Alpha',
      supervisor_id: 't1',
      members: ['t1', 't2'],
      start_date: '2023-01-01',
    },
  ])

  const [events, setEvents] = useState<OpEvent[]>([
    {
      id: 'e1',
      technician_id: 't2',
      type: 'falta',
      description: 'Falta não justificada',
      date: '2023-10-15',
      created_by: 'Gestor',
    },
  ])

  const [feedbacks, setFeedbacks] = useState<OpFeedback[]>([
    {
      id: 'f1',
      technician_id: 't1',
      rating: 5,
      comment: 'Excelente desempenho na última obra.',
      date: '2023-11-01',
    },
  ])

  const [pdis, setPdis] = useState<OpPDI[]>([
    {
      id: 'p1',
      technician_id: 't2',
      goal: 'Melhorar pontualidade',
      action: 'Acompanhamento semanal',
      deadline: '2024-01-01',
      status: 'em_andamento',
    },
  ])

  const [historyLogs, setHistoryLogs] = useState<OpHistory[]>([
    {
      id: 'h1',
      technician_id: 't1',
      action: 'Sistema',
      details: 'Conta criada',
      date: '2023-01-01T10:00:00Z',
    },
  ])

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
      if (t.members) {
        t.members.forEach((m) => addLog(m, 'Equipe', `Movimentação na equipe`))
      }
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
      addLog(f.technician_id, 'Feedback', `Novo feedback recebido (${f.rating} estrelas)`)
    },
    [addLog],
  )

  const addPDI = useCallback(
    (p: Omit<OpPDI, 'id'>) => {
      const id = Math.random().toString()
      setPdis((prev) => [...prev, { ...p, id }])
      addLog(p.technician_id, 'PDI', `Novo PDI criado: ${p.goal}`)
    },
    [addLog],
  )

  const updatePDI = useCallback(
    (id: string, p: Partial<OpPDI>) => {
      setPdis((prev) => {
        const existing = prev.find((x) => x.id === id)
        if (existing && p.status && existing.status !== p.status) {
          addLog(
            existing.technician_id,
            'PDI',
            `Status do PDI "${existing.goal}" alterado para ${p.status}`,
          )
        }
        return prev.map((x) => (x.id === id ? { ...x, ...p } : x))
      })
    },
    [addLog],
  )

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
