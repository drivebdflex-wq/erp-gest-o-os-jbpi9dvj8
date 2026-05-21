DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'measurement_status') THEN
    CREATE TYPE measurement_status AS ENUM ('aberta', 'em_conferencia', 'enviada', 'aprovada', 'faturada');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE RESTRICT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status measurement_status NOT NULL DEFAULT 'aberta'::measurement_status,
  total_value NUMERIC DEFAULT 0,
  travel_total NUMERIC DEFAULT 0,
  material_total NUMERIC DEFAULT 0,
  labor_total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS measurement_id UUID REFERENCES public.measurements(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "authenticated_select_measurements" ON public.measurements;
CREATE POLICY "authenticated_select_measurements" ON public.measurements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_measurements" ON public.measurements;
CREATE POLICY "authenticated_insert_measurements" ON public.measurements FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_measurements" ON public.measurements;
CREATE POLICY "authenticated_update_measurements" ON public.measurements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_measurements" ON public.measurements;
CREATE POLICY "authenticated_delete_measurements" ON public.measurements FOR DELETE TO authenticated USING (true);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_measurements ON public.measurements;
CREATE TRIGGER set_timestamp_measurements BEFORE UPDATE ON public.measurements FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Técnico BDFlex"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, name, password_hash)
    VALUES (new_user_id, 'bdflextecnico@gmail.com', 'Técnico BDFlex', 'placeholder_hash')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;
