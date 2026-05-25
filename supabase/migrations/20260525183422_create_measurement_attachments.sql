CREATE TABLE IF NOT EXISTS public.measurement_attachments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    measurement_id uuid REFERENCES public.measurements(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    storage_url text NOT NULL,
    uploaded_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.measurement_attachments ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "auth_all_measurement_attachments" ON public.measurement_attachments;
CREATE POLICY "auth_all_measurement_attachments" ON public.measurement_attachments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ensure RLS and Policies for measurements
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_full_access_measurements" ON public.measurements;
CREATE POLICY "authenticated_full_access_measurements" ON public.measurements
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
