DO $$
BEGIN
  -- 1. Extend Contracts table
  ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
  ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS has_monthly_measurement BOOLEAN DEFAULT false;
  ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS measurement_day INT;
END $$;

DO $$
BEGIN
  -- 2. Clean up service_orders nulls and duplicates before setting constraints
  UPDATE public.service_orders 
  SET service_order_number = 'OS-' || substr(id::text, 1, 8) 
  WHERE service_order_number IS NULL OR service_order_number = '';
END $$;

DO $$
BEGIN
  -- 3. Apply NOT NULL
  ALTER TABLE public.service_orders ALTER COLUMN service_order_number SET NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  -- 4. Apply UNIQUE constraint
  ALTER TABLE public.service_orders ADD CONSTRAINT service_orders_service_order_number_key UNIQUE (service_order_number);
EXCEPTION WHEN duplicate_table OR duplicate_object OR duplicate_alias OR unique_violation THEN NULL;
END $$;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 5. Seed user
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
      '{"name": "BD Flex Técnico"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, name, password_hash, status)
    VALUES (new_user_id, 'bdflextecnico@gmail.com', 'BD Flex Técnico', 'hashed', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
