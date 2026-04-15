import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name)
  private supabase: SupabaseClient | null = null

  getClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY

      if (!supabaseUrl || !supabaseKey) {
        this.logger.error(
          'Supabase configuration is missing. SUPABASE_URL and SUPABASE_KEY environment variables must be defined to establish connection.',
        )
        throw new InternalServerErrorException('Database connection is not configured.')
      }

      try {
        this.supabase = createClient(supabaseUrl, supabaseKey)
        this.logger.log('Database connection (Supabase/PostgreSQL) successfully established.')
      } catch (error: any) {
        this.logger.error(`Failed to initialize Supabase client: ${error.message}`, error.stack)
        throw new InternalServerErrorException('Failed to initialize database connection.')
      }
    }

    return this.supabase
  }
}
