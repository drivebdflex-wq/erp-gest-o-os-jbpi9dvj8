DO $$ 
BEGIN
    ALTER TABLE public.service_orders
    ADD COLUMN IF NOT EXISTS order_number text,
    ADD COLUMN IF NOT EXISTS ticket_number text,
    ADD COLUMN IF NOT EXISTS dependency text,
    ADD COLUMN IF NOT EXISTS floor text,
    ADD COLUMN IF NOT EXISTS service_type text,
    ADD COLUMN IF NOT EXISTS warranty text,
    ADD COLUMN IF NOT EXISTS incident_report boolean;
END $$;

CREATE TABLE IF NOT EXISTS public.service_order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    service_order_id uuid REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
    item_description text,
    unit text,
    quantity numeric,
    unit_value numeric,
    total_value numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_items" ON public.service_order_items;
CREATE POLICY "authenticated_select_items" ON public.service_order_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_items" ON public.service_order_items;
CREATE POLICY "authenticated_insert_items" ON public.service_order_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_items" ON public.service_order_items;
CREATE POLICY "authenticated_update_items" ON public.service_order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_items" ON public.service_order_items;
CREATE POLICY "authenticated_delete_items" ON public.service_order_items FOR DELETE TO authenticated USING (true);
