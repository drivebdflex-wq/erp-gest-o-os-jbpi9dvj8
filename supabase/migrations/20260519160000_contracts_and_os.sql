DO $$
BEGIN
  -- Update contracts table
  ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS contract_number TEXT;
  ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS sla_description TEXT;
  ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

  -- Update service_orders table
  ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL;
END $$;

-- Fix RLS Policies for tables used here
DROP POLICY IF EXISTS "authenticated_select" ON public.contracts;
CREATE POLICY "authenticated_select" ON public.contracts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.contracts;
CREATE POLICY "authenticated_insert" ON public.contracts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.contracts;
CREATE POLICY "authenticated_update" ON public.contracts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.contracts;
CREATE POLICY "authenticated_delete" ON public.contracts FOR DELETE TO authenticated USING (true);

-- Service Orders
DROP POLICY IF EXISTS "authenticated_select_so" ON public.service_orders;
CREATE POLICY "authenticated_select_so" ON public.service_orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_so" ON public.service_orders;
CREATE POLICY "authenticated_insert_so" ON public.service_orders FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_so" ON public.service_orders;
CREATE POLICY "authenticated_update_so" ON public.service_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_so" ON public.service_orders;
CREATE POLICY "authenticated_delete_so" ON public.service_orders FOR DELETE TO authenticated USING (true);

-- Clients
DROP POLICY IF EXISTS "authenticated_select_clients" ON public.clients;
CREATE POLICY "authenticated_select_clients" ON public.clients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_clients" ON public.clients;
CREATE POLICY "authenticated_insert_clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);

-- Seed user and data
DO $$
DECLARE
  new_user_id uuid;
  client_1_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  contract_1_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
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
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.users (id, email, name, status, password_hash)
    VALUES (new_user_id, 'bdflextecnico@gmail.com', 'Admin Técnico', 'active', 'hashed')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.clients (id, name, document, email)
  VALUES (client_1_id, 'Empresa Cliente Alpha', '12345678901234', 'contato@alpha.com')
  ON CONFLICT (document) DO NOTHING;

  INSERT INTO public.contracts (id, client_id, start_date, end_date, value, contract_number, sla_description, status)
  VALUES (contract_1_id, client_1_id, '2023-01-01', '2026-12-31', 50000, 'CT-2023-ALPHA', 'Atendimento 24h para críticas', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.service_orders (id, client_id, contract_id, status, priority, description)
  VALUES (gen_random_uuid(), client_1_id, contract_1_id, 'pending', 'high', 'Instalação de equipamento principal')
  ON CONFLICT (id) DO NOTHING;
END $$;
