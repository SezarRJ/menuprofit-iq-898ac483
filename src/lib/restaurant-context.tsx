import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Restaurant {
  id: string;
  name: string;
  city: string;
  default_currency: string;
  target_margin_pct: number;
}

interface RestaurantContextType {
  user: User | null;
  restaurant: Restaurant | null;
  loading: boolean;
  refreshRestaurant: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType>({
  user: null,
  restaurant: null,
  loading: true,
  refreshRestaurant: async () => {},
});

export const useRestaurant = () => useContext(RestaurantContext);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async (userId: string) => {
    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();
    setRestaurant(data);
  };

  const refreshRestaurant = async () => {
    if (user) await fetchRestaurant(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchRestaurant(u.id);
        } else {
          setRestaurant(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchRestaurant(u.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <RestaurantContext.Provider value={{ user, restaurant, loading, refreshRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}
