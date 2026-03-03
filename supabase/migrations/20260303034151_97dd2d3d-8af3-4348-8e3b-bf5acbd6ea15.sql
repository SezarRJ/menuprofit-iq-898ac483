
-- Customers table for loyalty tracking
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text DEFAULT '',
  tier text NOT NULL DEFAULT 'bronze',
  total_points integer NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0,
  visit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.customers FOR ALL USING (is_restaurant_owner(restaurant_id)) WITH CHECK (is_restaurant_owner(restaurant_id));
CREATE UNIQUE INDEX idx_customers_phone ON public.customers(restaurant_id, phone) WHERE phone != '';

-- Loyalty transactions
CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'earn',
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.loyalty_transactions FOR ALL USING (is_restaurant_owner(restaurant_id)) WITH CHECK (is_restaurant_owner(restaurant_id));

-- Fixed costs (rent, salaries - separate from operating_costs which are variable)
CREATE TABLE public.fixed_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  monthly_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.fixed_costs FOR ALL USING (is_restaurant_owner(restaurant_id)) WITH CHECK (is_restaurant_owner(restaurant_id));

-- Hidden costs (waste, packaging, cleaning)
CREATE TABLE public.hidden_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'waste',
  monthly_amount numeric NOT NULL DEFAULT 0,
  per_recipe boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hidden_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.hidden_costs FOR ALL USING (is_restaurant_owner(restaurant_id)) WITH CHECK (is_restaurant_owner(restaurant_id));

-- Pricing suggestions
CREATE TABLE public.pricing_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  min_safe_price numeric NOT NULL DEFAULT 0,
  recommended_price numeric NOT NULL DEFAULT 0,
  attractive_price numeric NOT NULL DEFAULT 0,
  premium_price numeric NOT NULL DEFAULT 0,
  explanation jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.pricing_suggestions FOR ALL USING (is_restaurant_owner(restaurant_id)) WITH CHECK (is_restaurant_owner(restaurant_id));

-- Promotions
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'bundle',
  description text DEFAULT '',
  suggested_price numeric NOT NULL DEFAULT 0,
  expected_margin numeric NOT NULL DEFAULT 0,
  attractiveness text DEFAULT 'medium',
  timing text DEFAULT '',
  reason text DEFAULT '',
  recipe_ids uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.promotions FOR ALL USING (is_restaurant_owner(restaurant_id)) WITH CHECK (is_restaurant_owner(restaurant_id));

-- Add baseline_plates to restaurants
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS baseline_plates integer NOT NULL DEFAULT 6000;

-- Add channel to sales_rows
ALTER TABLE public.sales_rows ADD COLUMN IF NOT EXISTS channel text DEFAULT 'dine-in';

-- Add customer phone/email to sales_rows for loyalty
ALTER TABLE public.sales_rows ADD COLUMN IF NOT EXISTS customer_phone text DEFAULT '';
ALTER TABLE public.sales_rows ADD COLUMN IF NOT EXISTS customer_email text DEFAULT '';
