DO $$
BEGIN
  ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS service_order_number text;
  ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS ticket_number text;
  ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS dependency text;
  ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS floor text;
  ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS warranty text;
  ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS service_type text;
  ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS incident_report boolean DEFAULT false;
END $$;

CREATE TABLE IF NOT EXISTS public.service_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  unit TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_value NUMERIC NOT NULL DEFAULT 0,
  total_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_so_items" ON public.service_order_items;
CREATE POLICY "authenticated_select_so_items" ON public.service_order_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_so_items" ON public.service_order_items;
CREATE POLICY "authenticated_insert_so_items" ON public.service_order_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_so_items" ON public.service_order_items;
CREATE POLICY "authenticated_update_so_items" ON public.service_order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_so_items" ON public.service_order_items;
CREATE POLICY "authenticated_delete_so_items" ON public.service_order_items FOR DELETE TO authenticated USING (true);
