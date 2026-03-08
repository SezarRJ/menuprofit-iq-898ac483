
-- Platform Admin Users
CREATE TABLE public.platform_admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'support' CHECK (role IN ('owner','support','analyst')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.platform_admin_users ENABLE ROW LEVEL SECURITY;

-- Platform Audit Logs
CREATE TABLE public.platform_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL DEFAULT '',
  target_id text DEFAULT '',
  reason text NOT NULL DEFAULT '',
  before_data jsonb DEFAULT '{}'::jsonb,
  after_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- Platform Feature Flags
CREATE TABLE public.platform_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  default_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_feature_flags ENABLE ROW LEVEL SECURITY;

-- Tenant Feature Flags
CREATE TABLE public.tenant_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  flag_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, flag_key)
);
ALTER TABLE public.tenant_feature_flags ENABLE ROW LEVEL SECURITY;

-- Tenant Limits (plan overrides)
CREATE TABLE public.tenant_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
  ingredients_limit integer NOT NULL DEFAULT 30,
  recipes_limit integer NOT NULL DEFAULT 20,
  inventory_limit integer NOT NULL DEFAULT 0,
  ai_monthly_quota integer NOT NULL DEFAULT 0,
  imports_limit integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_limits ENABLE ROW LEVEL SECURITY;

-- Platform Notifications
CREATE TABLE public.platform_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  target_plan text DEFAULT NULL,
  target_city text DEFAULT NULL,
  channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'draft',
  sent_count integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function for platform admin check
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admin_users
    WHERE user_id = _user_id AND is_active = true
  )
$$;

-- RLS Policies
-- platform_admin_users: only platform admins can read
CREATE POLICY "platform_admins_read" ON public.platform_admin_users FOR SELECT USING (is_platform_admin(auth.uid()));
CREATE POLICY "platform_admins_block_client_write" ON public.platform_admin_users FOR INSERT WITH CHECK (false);
CREATE POLICY "platform_admins_block_client_update" ON public.platform_admin_users FOR UPDATE USING (false) WITH CHECK (false);
CREATE POLICY "platform_admins_block_client_delete" ON public.platform_admin_users FOR DELETE USING (false);

-- platform_audit_logs: admins can read and insert
CREATE POLICY "platform_audit_read" ON public.platform_audit_logs FOR SELECT USING (is_platform_admin(auth.uid()));
CREATE POLICY "platform_audit_insert" ON public.platform_audit_logs FOR INSERT WITH CHECK (is_platform_admin(auth.uid()) AND actor_user_id = auth.uid());

-- platform_feature_flags: admins can CRUD
CREATE POLICY "flags_admin_all" ON public.platform_feature_flags FOR ALL USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));

-- tenant_feature_flags: admins can CRUD
CREATE POLICY "tenant_flags_admin_all" ON public.tenant_feature_flags FOR ALL USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));

-- tenant_limits: admins can CRUD
CREATE POLICY "tenant_limits_admin_all" ON public.tenant_limits FOR ALL USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));
-- tenants can read own limits
CREATE POLICY "tenant_limits_owner_read" ON public.tenant_limits FOR SELECT USING (is_restaurant_owner(tenant_id));

-- platform_notifications: admins only
CREATE POLICY "notifications_admin_all" ON public.platform_notifications FOR ALL USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));
