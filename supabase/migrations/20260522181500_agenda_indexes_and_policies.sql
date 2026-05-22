-- indexes
CREATE INDEX IF NOT EXISTS idx_so_scheduled_at ON public.service_orders USING btree (scheduled_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'service_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE service_orders;
  END IF;
END $$;

-- RLS just to be sure, although some already exist
DROP POLICY IF EXISTS "authenticated_select_so" ON public.service_orders;
CREATE POLICY "authenticated_select_so" ON public.service_orders
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_update_so" ON public.service_orders;
CREATE POLICY "authenticated_update_so" ON public.service_orders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
