
-- ============================================================
-- SMARTMENU SRS 3.0 — Kitchen Cost Engine & Intelligence Schema
-- ============================================================

-- 1. Extend ingredients with yield, waste, alert
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS yield_pct numeric NOT NULL DEFAULT 100;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS waste_pct numeric NOT NULL DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS alert_threshold numeric NOT NULL DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES suppliers(id);

-- 2. Ingredient price history
CREATE TABLE IF NOT EXISTS ingredient_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  price numeric NOT NULL DEFAULT 0,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_id uuid REFERENCES suppliers(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ingredient_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON ingredient_price_history FOR ALL TO authenticated
  USING (is_restaurant_owner(restaurant_id))
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- 3. Kitchen profiles (light/medium/heavy cook presets per restaurant)
CREATE TABLE IF NOT EXISTS kitchen_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  profile_type text NOT NULL DEFAULT 'medium',
  energy_cost numeric NOT NULL DEFAULT 0,
  labor_cost numeric NOT NULL DEFAULT 0,
  equipment_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, profile_type)
);
ALTER TABLE kitchen_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON kitchen_profiles FOR ALL TO authenticated
  USING (is_restaurant_owner(restaurant_id))
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- 4. Extend restaurants with packaging, washing, waste defaults
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS packaging_dinein numeric NOT NULL DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS packaging_takeaway numeric NOT NULL DEFAULT 500;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS packaging_delivery numeric NOT NULL DEFAULT 1000;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS washing_per_plate numeric NOT NULL DEFAULT 200;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS monthly_waste_budget numeric NOT NULL DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS min_margin_floor numeric NOT NULL DEFAULT 20;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS default_kitchen_profile text NOT NULL DEFAULT 'medium';

-- 5. Extend recipes with kitchen profile and packaging channel
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS kitchen_profile text NOT NULL DEFAULT 'medium';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS packaging_channel text NOT NULL DEFAULT 'dine-in';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_protected boolean NOT NULL DEFAULT false;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS target_margin_pct numeric;

-- 6. Competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  tier text NOT NULL DEFAULT 'mid-range',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON competitors FOR ALL TO authenticated
  USING (is_restaurant_owner(restaurant_id))
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- 7. AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  reasoning text NOT NULL DEFAULT '',
  impact text NOT NULL DEFAULT '',
  confidence integer NOT NULL DEFAULT 50,
  target_item text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON ai_recommendations FOR ALL TO authenticated
  USING (is_restaurant_owner(restaurant_id))
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- 8. Actions table (DB-backed)
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'new',
  due_date date,
  assignee text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  recommendation_id uuid REFERENCES ai_recommendations(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON actions FOR ALL TO authenticated
  USING (is_restaurant_owner(restaurant_id))
  WITH CHECK (is_restaurant_owner(restaurant_id));
