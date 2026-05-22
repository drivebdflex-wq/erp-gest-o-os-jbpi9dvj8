-- Make settings tables readable by authenticated users
DROP POLICY IF EXISTS "auth_select_companies" ON public.companies;
CREATE POLICY "auth_select_companies" ON public.companies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_users" ON public.users;
CREATE POLICY "auth_select_users" ON public.users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_teams" ON public.teams;
CREATE POLICY "auth_select_teams" ON public.teams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_technicians" ON public.technicians;
CREATE POLICY "auth_select_technicians" ON public.technicians FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_clients" ON public.clients;
CREATE POLICY "auth_select_clients" ON public.clients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_sla_definitions" ON public.sla_definitions;
CREATE POLICY "auth_select_sla_definitions" ON public.sla_definitions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_checklists" ON public.checklists;
CREATE POLICY "auth_select_checklists" ON public.checklists FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_service_categories" ON public.service_categories;
CREATE POLICY "auth_select_service_categories" ON public.service_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_service_types_config" ON public.service_types_config;
CREATE POLICY "auth_select_service_types_config" ON public.service_types_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_roles" ON public.roles;
CREATE POLICY "auth_select_roles" ON public.roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_system_parameters" ON public.system_parameters;
CREATE POLICY "auth_select_system_parameters" ON public.system_parameters FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_select_units" ON public.units;
CREATE POLICY "auth_select_units" ON public.units FOR SELECT TO authenticated USING (true);
