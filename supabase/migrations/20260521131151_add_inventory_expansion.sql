DO $$
BEGIN
  -- Create suppliers table
  CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    document VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Create purchase_orders table
  CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    status VARCHAR DEFAULT 'pending',
    total_amount NUMERIC DEFAULT 0,
    expected_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Create stock_movements table
  CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('in', 'out', 'transfer')),
    origin_location VARCHAR,
    destination_location VARCHAR,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Alter inventory table to add vehicle_id if it doesn't exist
  ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE;

  -- Add triggers for updated_at
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_suppliers'
  ) THEN
    CREATE TRIGGER set_timestamp_suppliers BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_purchase_orders'
  ) THEN
    CREATE TRIGGER set_timestamp_purchase_orders BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_stock_movements'
  ) THEN
    CREATE TRIGGER set_timestamp_stock_movements BEFORE UPDATE ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END $$;

-- RLS for suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_suppliers" ON public.suppliers;
CREATE POLICY "auth_all_suppliers" ON public.suppliers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS for purchase_orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_purchase_orders" ON public.purchase_orders;
CREATE POLICY "auth_all_purchase_orders" ON public.purchase_orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS for stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_stock_movements" ON public.stock_movements;
CREATE POLICY "auth_all_stock_movements" ON public.stock_movements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auth Seed for the specified user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'bdflextecnico@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'bdflextecnico@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Técnico"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, name, status)
    VALUES (new_user_id, 'bdflextecnico@gmail.com', 'Admin Técnico', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
