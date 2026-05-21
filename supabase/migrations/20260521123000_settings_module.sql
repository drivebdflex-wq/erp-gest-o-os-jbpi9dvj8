-- Ensure idempotent seed of auth user
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'bdflextecnico@gmail.com') THEN
    DECLARE
      new_user_id uuid := gen_random_uuid();
    BEGIN
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
        '{"name": "Admin"}',
        false, 'authenticated', 'authenticated',
        '', '', '', '', '', NULL, '', '', ''
      );

      INSERT INTO public.users (id, name, email, password_hash, status)
      VALUES (new_user_id, 'Admin', 'bdflextecnico@gmail.com', 'hashed', 'active')
      ON CONFLICT (email) DO NOTHING;
    END;
  END IF;
END $$;

-- Create settings master data tables
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document TEXT,
    logo_url TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prefix TEXT,
    address TEXT,
    environment TEXT,
    floor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_types_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sla_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    response_time_minutes INT,
    resolution_time_minutes INT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS sla_id UUID REFERENCES public.sla_definitions(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN null; END $$;

-- RLS Policies
DO $$ BEGIN
  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "auth_all_companies" ON public.companies;
  CREATE POLICY "auth_all_companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

  ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "auth_all_units" ON public.units;
  CREATE POLICY "auth_all_units" ON public.units FOR ALL TO authenticated USING (true) WITH CHECK (true);

  ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "auth_all_sc" ON public.service_categories;
  CREATE POLICY "auth_all_sc" ON public.service_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

  ALTER TABLE public.service_types_config ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "auth_all_st" ON public.service_types_config;
  CREATE POLICY "auth_all_st" ON public.service_types_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

  ALTER TABLE public.system_parameters ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "auth_all_sp" ON public.system_parameters;
  CREATE POLICY "auth_all_sp" ON public.system_parameters FOR ALL TO authenticated USING (true) WITH CHECK (true);

  ALTER TABLE public.sla_definitions ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "auth_all_sla" ON public.sla_definitions;
  CREATE POLICY "auth_all_sla" ON public.sla_definitions FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
