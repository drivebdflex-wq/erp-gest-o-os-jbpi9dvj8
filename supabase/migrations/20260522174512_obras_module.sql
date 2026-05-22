DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('planejamento', 'mobilização', 'execução', 'finalização', 'concluída');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number TEXT,
  name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
  address TEXT,
  technical_responsible TEXT,
  art_number TEXT,
  start_date DATE,
  end_date DATE,
  total_value NUMERIC DEFAULT 0,
  status project_status DEFAULT 'planejamento',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  responsible_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  completion_percentage NUMERIC DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  status TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_finance_type') THEN
    CREATE TYPE project_finance_type AS ENUM ('purchase', 'operational_cost', 'revenue', 'misc_expense');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.project_finance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type project_finance_type NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_finance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "auth_all_projects" ON public.projects;
    CREATE POLICY "auth_all_projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "auth_all_project_stages" ON public.project_stages;
    CREATE POLICY "auth_all_project_stages" ON public.project_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "auth_all_project_finance" ON public.project_finance;
    CREATE POLICY "auth_all_project_finance" ON public.project_finance FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
