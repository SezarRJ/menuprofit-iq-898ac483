import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  default_currency: string;
  target_margin_pct: number;
}

export type PlanTier = "free" | "pro" | "elite";
export type AppRole = "user" | "staff" | "admin" | "master_admin" | "billing_admin" | "support_agent" | "auditor";

interface RestaurantContextType {
  user: User | null;
  restaurant: Restaurant | null;
  loading: boolean;
  plan: PlanTier;
  roles: AppRole[];
  isAdmin: boolean;
  refreshRestaurant: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType>({
  user: null,
  restaurant: null,
  loading: true,
  plan: "free",
  roles: [],
  isAdmin: false,
  refreshRestaurant: async () => {},
});

export const useRestaurant = () => useContext(RestaurantContext);

// Plan feature gates
export const PLAN_FEATURES: Record<string, PlanTier[]> = {
  dashboard: ["free", "pro", "elite"],
  costs: ["free", "pro", "elite"],
  ingredients: ["free", "pro", "elite"],
  recipes: ["free", "pro", "elite"],
  "discount-rules": ["pro", "elite"],
  sales: ["pro", "elite"],
  "ai-assistant": ["elite"],
  setup: ["free", "pro", "elite"],
};

export function canAccessFeature(feature: string, plan: PlanTier): boolean {
  const allowed = PLAN_FEATURES[feature];
  if (!allowed) return true;
  return allowed.includes(plan);
}

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanTier>("free");
  const [roles, setRoles] = useState<AppRole[]>([]);

  const fetchRestaurant = async (userId: string) => {
    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();
    setRestaurant(data);

    // Fetch subscription plan
    if (data) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("restaurant_id", data.id)
        .maybeSingle();
      setPlan((sub?.plan as PlanTier) ?? "free");
    }

    // Fetch user roles
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles((userRoles?.map(r => r.role as AppRole)) ?? ["user"]);
  };

  const refreshRestaurant = async () => {
    if (user) await fetchRestaurant(user.id);
  };

  const isAdmin = roles.some(r => ["admin", "master_admin", "billing_admin", "support_agent", "auditor"].includes(r));

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchRestaurant(u.id);
        } else {
          setRestaurant(null);
          setPlan("free");
          setRoles([]);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchRestaurant(u.id).finally(() => { if (mounted) setLoading(false); });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <RestaurantContext.Provider value={{ user, restaurant, loading, plan, roles, isAdmin, refreshRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}
