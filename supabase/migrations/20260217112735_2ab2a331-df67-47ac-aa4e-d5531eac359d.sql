
-- Check what exists and create what's missing

-- PHASE 1: USER ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('user', 'staff', 'admin', 'master_admin', 'billing_admin', 'support_agent', 'auditor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, restaurant_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Service role manages roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Service role manages roles"
  ON public.user_roles FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'master_admin', 'billing_admin', 'support_agent', 'auditor')) $$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- PHASE 2: SUBSCRIPTIONS
DO $$ BEGIN
  CREATE TYPE public.plan_tier AS ENUM ('free', 'pro', 'elite');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan plan_tier NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "No client mutation" ON public.subscriptions;

CREATE POLICY "Owners can read own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (is_restaurant_owner(restaurant_id));

-- Block all client mutations (service_role bypasses RLS)
CREATE POLICY "Block client delete on subscriptions"
  ON public.subscriptions FOR DELETE
  TO authenticated
  USING (false);

CREATE POLICY "Block client update on subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block client insert on subscriptions"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.get_restaurant_plan(_restaurant_id uuid)
RETURNS plan_tier LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT plan FROM public.subscriptions WHERE restaurant_id = _restaurant_id AND status = 'active'), 'free'::plan_tier) $$;

CREATE OR REPLACE FUNCTION public.handle_new_restaurant_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN INSERT INTO public.subscriptions (restaurant_id, plan, status) VALUES (NEW.id, 'free', 'active'); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS on_restaurant_created_subscription ON public.restaurants;
CREATE TRIGGER on_restaurant_created_subscription
  AFTER INSERT ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.handle_new_restaurant_subscription();

-- PHASE 3: AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- PHASE 4: ADMIN ACCESS LOGS
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  dataset text NOT NULL,
  filters_used jsonb DEFAULT '{}'::jsonb,
  reason text,
  action_type text NOT NULL DEFAULT 'view',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read access logs" ON public.admin_access_logs;
DROP POLICY IF EXISTS "Admins can insert access logs" ON public.admin_access_logs;

CREATE POLICY "Admins can read access logs"
  ON public.admin_access_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert access logs"
  ON public.admin_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid() AND public.is_admin(auth.uid()));

-- PHASE 5: AI USAGE LOGS
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  tokens_used integer NOT NULL DEFAULT 0,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read own AI usage" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "No client insert" ON public.ai_usage_logs;

CREATE POLICY "Owners can read own AI usage"
  ON public.ai_usage_logs FOR SELECT
  TO authenticated
  USING (is_restaurant_owner(restaurant_id));

CREATE POLICY "Block client insert on ai_usage"
  ON public.ai_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.get_monthly_ai_tokens(_restaurant_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE(SUM(tokens_used), 0)::integer FROM public.ai_usage_logs WHERE restaurant_id = _restaurant_id AND created_at >= date_trunc('month', now()) $$;

-- PHASE 6: STRIPE PROCESSED EVENTS
CREATE TABLE IF NOT EXISTS public.stripe_processed_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block client select on stripe events"
  ON public.stripe_processed_events FOR SELECT
  TO authenticated
  USING (false);

CREATE POLICY "Block client insert on stripe events"
  ON public.stripe_processed_events FOR INSERT
  TO authenticated
  WITH CHECK (false);
