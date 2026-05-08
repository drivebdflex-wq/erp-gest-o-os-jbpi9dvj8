// Mock Supabase client for environments without full backend integration
// Simulated to behave exactly like the @supabase/supabase-js client

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    code: 'CAB-001',
    name: 'Cabo UTP Cat6',
    description: 'Cabo de rede trançado',
    category: 'Cabeamento',
    unit: 'm',
    average_cost: 3,
    price: 3,
    minimum_stock: 500,
    quantity: 1500,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    code: 'CON-001',
    name: 'Conector RJ45',
    description: 'Conector de ponta de cabo',
    category: 'Conectores',
    unit: 'un',
    average_cost: 1,
    price: 1,
    minimum_stock: 1000,
    quantity: 2000,
    created_at: new Date().toISOString(),
  },
]

const MOCK_INVENTORY = [
  { id: 'b1', product_id: 'p1', location_type: 'central', location_id: 'central', quantity: 1500 },
  { id: 'b2', product_id: 'p2', location_type: 'central', location_id: 'central', quantity: 2000 },
]

export const isMock = true

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signInWithPassword: async (credentials: any) => {
      if (credentials.email && credentials.password) {
        const user = {
          id: 'mock-user-1',
          email: credentials.email,
          user_metadata: { name: 'Admin', role_id: 'role-admin' },
        }
        return { data: { user, session: { user, access_token: 'mock-token' } }, error: null }
      }
      return { data: null, error: { message: 'Invalid login' } }
    },
    signOut: async () => ({ error: null }),
    signUp: async (credentials: any) => {
      const user = {
        id: 'mock-user-new',
        email: credentials.email,
        user_metadata: credentials.options?.data,
      }
      return { data: { user, session: null }, error: null }
    },
  },
  from: (table: string) => {
    return {
      select: async (query: string = '*') => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Simulating a missing table error if queried
        if (table === 'missing_table') {
          return {
            data: null,
            error: { code: '42P01', message: `relation "public.${table}" does not exist` },
          }
        }

        if (table === 'products') {
          return { data: MOCK_PRODUCTS, error: null }
        }

        if (table === 'inventory') {
          return { data: MOCK_INVENTORY, error: null }
        }

        return { data: [], error: null }
      },
      insert: async (data: any) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return { data: Array.isArray(data) ? data : [data], error: null }
      },
    }
  },
}
