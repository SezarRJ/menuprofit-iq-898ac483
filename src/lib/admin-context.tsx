import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextType {
  userId: string | null;
  adminRole: string | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  logAction: (action: string, targetType: string, targetId: string, reason: string, before?: any, after?: any) => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  userId: null, adminRole: null, isAdmin: false, loading: true,
  logout: async () => {}, logAction: async () => {},
});

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      
      const { data } = await supabase
        .from("platform_admin_users")
        .select("role, is_active")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.is_active) {
        setAdminRole(data.role);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    check();
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setAdminRole(null);
  };

  const logAction = async (action: string, targetType: string, targetId: string, reason: string, before?: any, after?: any) => {
    if (!userId) return;
    await supabase.from("platform_audit_logs").insert({
      actor_user_id: userId,
      action,
      target_type: targetType,
      target_id: targetId,
      reason,
      before_data: before || {},
      after_data: after || {},
    });
  };

  return (
    <AdminContext.Provider value={{ userId, adminRole, isAdmin: !!adminRole, loading, logout, logAction }}>
      {children}
    </AdminContext.Provider>
  );
}
