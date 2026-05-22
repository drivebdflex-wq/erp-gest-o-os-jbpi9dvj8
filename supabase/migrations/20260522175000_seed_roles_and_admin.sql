DO $$
DECLARE
  v_admin_role_id uuid;
  v_supervisor_role_id uuid;
  v_user_id uuid;
BEGIN
  -- Insert roles
  INSERT INTO public.roles (name, description)
  VALUES ('administrator', 'Administrador do sistema')
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO public.roles (name, description)
  VALUES ('supervisor', 'Supervisor Operacional')
  ON CONFLICT (name) DO NOTHING;
  
  SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'administrator' LIMIT 1;
  SELECT id INTO v_supervisor_role_id FROM public.roles WHERE name = 'supervisor' LIMIT 1;

  -- Create or find the user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'bdflextecnico@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'bdflextecnico@gmail.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin bdflex"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.users (id, name, email, password_hash)
    VALUES (v_user_id, 'Admin bdflex', 'bdflextecnico@gmail.com', 'hashed')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'bdflextecnico@gmail.com' LIMIT 1;
    
    INSERT INTO public.users (id, name, email, password_hash)
    VALUES (v_user_id, 'Admin bdflex', 'bdflextecnico@gmail.com', 'hashed')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Assign administrator role to user
  IF v_user_id IS NOT NULL AND v_admin_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_user_id, v_admin_role_id)
    ON CONFLICT ON CONSTRAINT user_roles_pkey DO NOTHING;
  END IF;
END $$;
