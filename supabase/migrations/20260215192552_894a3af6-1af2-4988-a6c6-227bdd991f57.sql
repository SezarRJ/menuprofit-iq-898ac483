
-- Restaurants
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  city text NOT NULL DEFAULT 'أربيل',
  default_currency text NOT NULL DEFAULT 'IQD',
  target_margin_pct numeric NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Recipes (needed before helper functions)
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'عام',
  selling_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sales Imports (needed before helper functions)
CREATE TABLE public.sales_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  file_name text NOT NULL DEFAULT '',
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Now create helper functions
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(_restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.restaurants WHERE id = _restaurant_id AND owner_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_recipe_owner(_recipe_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.recipes r JOIN public.restaurants rest ON r.restaurant_id = rest.id WHERE r.id = _recipe_id AND rest.owner_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_sales_import_owner(_import_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.sales_imports si JOIN public.restaurants rest ON si.restaurant_id = rest.id WHERE si.id = _import_id AND rest.owner_id = auth.uid())
$$;

-- RLS for restaurants
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_all" ON public.restaurants FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- RLS for recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.recipes FOR ALL TO authenticated USING (public.is_restaurant_owner(restaurant_id)) WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- RLS for sales_imports
ALTER TABLE public.sales_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.sales_imports FOR ALL TO authenticated USING (public.is_restaurant_owner(restaurant_id)) WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- Operating Costs
CREATE TABLE public.operating_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  cost_type text NOT NULL CHECK (cost_type IN ('fixed','variable')),
  monthly_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.operating_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.operating_costs FOR ALL TO authenticated USING (public.is_restaurant_owner(restaurant_id)) WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- Ingredients
CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'كغم',
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.ingredients FOR ALL TO authenticated USING (public.is_restaurant_owner(restaurant_id)) WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- Recipe Ingredients
CREATE TABLE public.recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 0
);
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.recipe_ingredients FOR ALL TO authenticated USING (public.is_recipe_owner(recipe_id)) WITH CHECK (public.is_recipe_owner(recipe_id));

-- Competitor Prices
CREATE TABLE public.competitor_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  competitor_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.competitor_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.competitor_prices FOR ALL TO authenticated USING (public.is_recipe_owner(recipe_id)) WITH CHECK (public.is_recipe_owner(recipe_id));

-- Volume Discount Rules
CREATE TABLE public.volume_discount_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  min_weekly_volume integer NOT NULL DEFAULT 0,
  discount_pct numeric NOT NULL DEFAULT 0,
  min_margin_pct numeric NOT NULL DEFAULT 0
);
ALTER TABLE public.volume_discount_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.volume_discount_rules FOR ALL TO authenticated USING (public.is_restaurant_owner(restaurant_id)) WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- Sales Rows
CREATE TABLE public.sales_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_import_id uuid NOT NULL REFERENCES public.sales_imports(id) ON DELETE CASCADE,
  sale_date date,
  dish_name text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 0,
  matched_recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.sales_rows FOR ALL TO authenticated USING (public.is_sales_import_owner(sales_import_id)) WITH CHECK (public.is_sales_import_owner(sales_import_id));

-- Mapping Profiles
CREATE TABLE public.mapping_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  profile_name text NOT NULL DEFAULT '',
  date_column text,
  dish_column text,
  quantity_column text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mapping_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON public.mapping_profiles FOR ALL TO authenticated USING (public.is_restaurant_owner(restaurant_id)) WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
