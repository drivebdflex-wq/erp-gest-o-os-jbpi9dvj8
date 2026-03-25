import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name)
  private supabase: SupabaseClient

  onModuleInit() {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey =
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-key'

    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.logger.log('Database connection (Supabase/PostgreSQL) successfully established.')
  }

  getClient(): SupabaseClient {
    return this.supabase
  }
}
