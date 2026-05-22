DO $$
BEGIN
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS trading_name text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS state_registration text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS email text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS website text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS zip_code text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_number text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS city text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS state text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS slogan text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS technical_responsible text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS crea text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS cnae text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS billing_info text;
END $$;

INSERT INTO public.companies (id, name, trading_name, document)
SELECT gen_random_uuid(), 'Empresa Principal', 'Empresa Principal', '00.000.000/0001-00'
WHERE NOT EXISTS (SELECT 1 FROM public.companies);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Logos are publicly accessible" ON storage.objects;
CREATE POLICY "Logos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
CREATE POLICY "Authenticated users can update logos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'company-logos');
