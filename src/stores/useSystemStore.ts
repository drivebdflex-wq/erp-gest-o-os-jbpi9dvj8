import { create } from 'zustand'
import { repositoryDataMap } from '@/lib/mock-db'

export interface AuditLog {
  id: string
  user_id: string | null
  user_name: string | null
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'HARD_DELETE'
  table_name: string
  record_id: string
  old_value: any
  new_value: any
  ip_address: string
  user_agent: string
  created_at: string
}

export interface DeletedRecord {
  id: string
  table_name: string
  record_id: string
  data: any
  deleted_by: string | null
  deleted_by_name: string | null
  deleted_at: string
}

interface SystemStore {
  auditLogs: AuditLog[]
  deletedRecords: DeletedRecord[]
  logAudit: (log: Omit<AuditLog, 'id' | 'created_at'>) => void
  addDeletedRecord: (record: Omit<DeletedRecord, 'id' | 'deleted_at'>) => void
  restoreRecord: (id: string, userId: string, userName: string) => boolean
  hardDeleteRecord: (id: string, userId: string, userName: string) => boolean
  runRetentionPolicy: () => void
}

const initialAuditLogs: AuditLog[] = [
  {
    id: crypto.randomUUID(),
    user_id: '22222222-2222-2222-2222-222222222222',
    user_name: 'Admin User',
    action: 'CREATE',
    table_name: 'service_orders',
    record_id: '55555555-5555-5555-5555-555555555555',
    old_value: null,
    new_value: { status: 'pending', priority: 'high', description: 'Manutenção Preventiva' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    user_id: '22222222-2222-2222-2222-222222222222',
    user_name: 'Admin User',
    action: 'UPDATE',
    table_name: 'service_orders',
    record_id: '55555555-5555-5555-5555-555555555555',
    old_value: { status: 'pending' },
    new_value: { status: 'in_progress' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    user_id: '11111111-1111-1111-1111-111111111111',
    user_name: 'João Supervisor',
    action: 'DELETE',
    table_name: 'contracts',
    record_id: '77777777-7777-7777-7777-777777777777',
    old_value: { name: 'Contrato Antigo', value: 5000 },
    new_value: null,
    ip_address: '192.168.1.105',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    user_id: '22222222-2222-2222-2222-222222222222',
    user_name: 'Admin User',
    action: 'RESTORE',
    table_name: 'contracts',
    record_id: '77777777-7777-7777-7777-777777777777',
    old_value: null,
    new_value: { name: 'Contrato Antigo', value: 5000 },
    ip_address: '192.168.1.105',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
]

const initialDeletedRecords: DeletedRecord[] = [
  {
    id: crypto.randomUUID(),
    table_name: 'contracts',
    record_id: '99999999-9999-9999-9999-999999999999',
    data: {
      id: '99999999-9999-9999-9999-999999999999',
      name: 'Contrato Cancelado',
      type: 'Obra',
      value: 12000,
    },
    deleted_by: '22222222-2222-2222-2222-222222222222',
    deleted_by_name: 'Admin User',
    deleted_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    table_name: 'technicians',
    record_id: '44444444-4444-4444-4444-444444444444',
    data: {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Carlos Silva',
      specialty: 'Elétrica',
    },
    deleted_by: '22222222-2222-2222-2222-222222222222',
    deleted_by_name: 'Admin User',
    deleted_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: crypto.randomUUID(),
    table_name: 'inventory',
    record_id: '12345678-1234-1234-1234-123456789012',
    data: { id: '12345678-1234-1234-1234-123456789012', name: 'Lote Defeituoso', quantity: 0 },
    deleted_by: '11111111-1111-1111-1111-111111111111',
    deleted_by_name: 'João Supervisor',
    deleted_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago (should be purged)
  },
]

export const useSystemStore = create<SystemStore>((set, get) => ({
  auditLogs: initialAuditLogs,
  deletedRecords: initialDeletedRecords,
  logAudit: (log) => {
    set((state) => ({
      auditLogs: [
        { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...log },
        ...state.auditLogs,
      ],
    }))
  },
  addDeletedRecord: (record) => {
    set((state) => ({
      deletedRecords: [
        { id: crypto.randomUUID(), deleted_at: new Date().toISOString(), ...record },
        ...state.deletedRecords,
      ],
    }))
  },
  restoreRecord: (id, userId, userName) => {
    const state = get()
    const record = state.deletedRecords.find((r) => r.id === id)
    if (!record) return false

    // Put back into the repository map if it exists
    const tableData = repositoryDataMap[record.table_name]
    if (tableData) {
      tableData.push(record.data)
    }

    set({ deletedRecords: state.deletedRecords.filter((r) => r.id !== id) })

    get().logAudit({
      user_id: userId,
      user_name: userName,
      action: 'RESTORE',
      table_name: record.table_name,
      record_id: record.record_id,
      old_value: null,
      new_value: record.data,
      ip_address: '127.0.0.1',
      user_agent: navigator.userAgent,
    })

    return true
  },
  hardDeleteRecord: (id, userId, userName) => {
    const state = get()
    const record = state.deletedRecords.find((r) => r.id === id)
    if (!record) return false

    set({ deletedRecords: state.deletedRecords.filter((r) => r.id !== id) })

    get().logAudit({
      user_id: userId,
      user_name: userName,
      action: 'HARD_DELETE',
      table_name: record.table_name,
      record_id: record.record_id,
      old_value: record.data,
      new_value: null,
      ip_address: '127.0.0.1',
      user_agent: navigator.userAgent,
    })

    return true
  },
  runRetentionPolicy: () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    set((state) => ({
      deletedRecords: state.deletedRecords.filter((r) => new Date(r.deleted_at) >= thirtyDaysAgo),
    }))
  },
}))
