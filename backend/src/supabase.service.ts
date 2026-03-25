import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name)
  private supabase!: SupabaseClient

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase configuration is missing. SUPABASE_URL and SUPABASE_KEY environment variables must be defined to start the application.',
      )
    }

    this.logger.log(`SUPABASE_URL=${supabaseUrl}`)
    this.logger.log(`SUPABASE_KEY=${supabaseKey}`)

    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.logger.log('Database connection (Supabase/PostgreSQL) successfully established.')
  }

  getClient(): SupabaseClient {
    return this.supabase
  }
}
