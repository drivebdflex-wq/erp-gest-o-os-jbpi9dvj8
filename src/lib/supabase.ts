// Safe mock Supabase client for environments without full backend integration
// Simulated to behave like the @supabase/supabase-js client without crashing

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

class MockQueryBuilder {
  constructor(
    private resultData: any,
    private resultError: any,
  ) {}

  select() {
    return this
  }
  order() {
    return this
  }
  eq() {
    return this
  }
  limit() {
    return this
  }
  single() {
    return new MockQueryBuilder(
      Array.isArray(this.resultData) ? this.resultData[0] : this.resultData,
      this.resultError,
    )
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return new Promise((resolve) => setTimeout(resolve, 300))
      .then(() => ({ data: this.resultData, error: this.resultError }))
      .then(onfulfilled, onrejected)
  }

  catch(onrejected?: (reason: any) => any) {
    return this.then(undefined, onrejected)
  }
}

export const supabase = {
  auth: {
    getSession: async () => {
      try {
        const stored = localStorage.getItem('fieldops_session')
        if (stored) {
          return { data: { session: JSON.parse(stored) }, error: null }
        }
      } catch (e) {
        // ignore parse error
      }
      return { data: { session: null }, error: null }
    },
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signInWithPassword: async (credentials: any) => {
      if (credentials.email && credentials.password) {
        const user = {
          id: 'mock-user-1',
          email: credentials.email,
          user_metadata: { name: credentials.email.split('@')[0], role_id: 'role-admin' },
        }
        const session = { user, access_token: 'mock-token' }
        localStorage.setItem('fieldops_session', JSON.stringify(session))
        return { data: { user, session }, error: null }
      }
      return { data: null, error: { message: 'Credenciais inválidas. Tente novamente.' } }
    },
    signOut: async () => {
      localStorage.removeItem('fieldops_session')
      return { error: null }
    },
    signUp: async (credentials: any) => {
      const user = {
        id: 'mock-user-new',
        email: credentials.email,
        user_metadata: credentials.options?.data || {
          name: credentials.email.split('@')[0],
          role_id: 'role-admin',
        },
      }
      const session = { user, access_token: 'mock-token-new' }
      localStorage.setItem('fieldops_session', JSON.stringify(session))
      return { data: { user, session }, error: null }
    },
  },
  from: (table: string) => {
    return {
      select: (query: string = '*') => {
        if (table === 'inventory_not_exist') {
          return new MockQueryBuilder(null, {
            code: '42P01',
            message: `relation "public.${table}" does not exist`,
          })
        }
        if (table === 'products') return new MockQueryBuilder([...MOCK_PRODUCTS], null)
        if (table === 'inventory') return new MockQueryBuilder([...MOCK_INVENTORY], null)
        if (table === 'movements') return new MockQueryBuilder([], null)
        return new MockQueryBuilder([], null)
      },
      insert: (data: any) => new MockQueryBuilder(Array.isArray(data) ? data : [data], null),
      update: (data: any) => new MockQueryBuilder(Array.isArray(data) ? data : [data], null),
      delete: () => new MockQueryBuilder([], null),
    }
  },
}
