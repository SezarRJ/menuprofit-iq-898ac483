import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileUp, Sparkles, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  planDist: { free: number; pro: number; elite: number };
  totalImportsToday: number;
  aiCallsToday: number;
  ingredientAlerts: number;
  staleTenants: number;
  topTenants: { id: string; name: string; city: string; recipes: number }[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Fetch restaurants
      const { data: restaurants } = await supabase.from("restaurants").select("id, name, city, created_at");
      const tenants = restaurants || [];

      // Fetch subscriptions
      const { data: subs } = await supabase.from("subscriptions").select("restaurant_id, plan, status");
      const subMap = new Map((subs || []).map(s => [s.restaurant_id, s]));

      const active = tenants.filter(t => {
        const s = subMap.get(t.id);
        return !s || s.status === "active";
      }).length;

      const suspended = tenants.filter(t => {
        const s = subMap.get(t.id);
        return s?.status === "suspended";
      }).length;

      const planDist = { free: 0, pro: 0, elite: 0 };
      (subs || []).forEach(s => {
        if (s.plan in planDist) planDist[s.plan as keyof typeof planDist]++;
      });

      // Imports today
      const today = new Date().toISOString().split("T")[0];
      const { count: importsToday } = await supabase
        .from("sales_imports")
        .select("id", { count: "exact", head: true })
        .gte("uploaded_at", today);

      // AI calls today
      const { count: aiToday } = await supabase
        .from("ai_usage_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today);

      // Ingredient alerts
      const { data: ingredients } = await supabase
        .from("ingredients")
        .select("id, alert_threshold, unit_price")
        .gt("alert_threshold", 0);
      const alerts = (ingredients || []).filter(i => i.unit_price <= i.alert_threshold).length;

      // Stale tenants (no sales import in 7 days)
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: recentImports } = await supabase
        .from("sales_imports")
        .select("restaurant_id")
        .gte("uploaded_at", weekAgo);
      const recentSet = new Set((recentImports || []).map(r => r.restaurant_id));
      const stale = tenants.filter(t => !recentSet.has(t.id)).length;

      // Top tenants by recipe count
      const { data: recipes } = await supabase.from("recipes").select("restaurant_id");
      const recipeCounts = new Map<string, number>();
      (recipes || []).forEach(r => recipeCounts.set(r.restaurant_id, (recipeCounts.get(r.restaurant_id) || 0) + 1));
      const topTenants = [...recipeCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, count]) => {
          const t = tenants.find(t => t.id === id);
          return { id, name: t?.name || "Unknown", city: t?.city || "", recipes: count };
        });

      setStats({
        totalTenants: tenants.length,
        activeTenants: active,
        suspendedTenants: suspended,
        planDist,
        totalImportsToday: importsToday || 0,
        aiCallsToday: aiToday || 0,
        ingredientAlerts: alerts,
        staleTenants: stale,
        topTenants,
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10">
              <CardContent className="pt-6"><Skeleton className="h-8 w-20 bg-white/10" /></CardContent>
            </Card>
          ))}
        </div>
      </AdminLayout>
    );
  }

  const s = stats!;
  const cards = [
    { label: "Total Tenants", value: s.totalTenants, icon: Users, color: "text-indigo-400" },
    { label: "Active", value: s.activeTenants, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Suspended", value: s.suspendedTenants, icon: AlertTriangle, color: "text-red-400" },
    { label: "Imports Today", value: s.totalImportsToday, icon: FileUp, color: "text-sky-400" },
    { label: "AI Calls Today", value: s.aiCallsToday, icon: Sparkles, color: "text-violet-400" },
    { label: "Ingredient Alerts", value: s.ingredientAlerts, icon: AlertTriangle, color: "text-amber-400" },
    { label: "Stale Tenants (7d)", value: s.staleTenants, icon: Clock, color: "text-orange-400" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <Card key={c.label} className="bg-white/5 border-white/10">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <c.icon className={`w-5 h-5 ${c.color}`} />
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Plan distribution card */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-gray-500 mb-2">Plans</p>
            <div className="flex gap-2">
              <Badge className="bg-gray-600/30 text-gray-300 border-0">Free: {s.planDist.free}</Badge>
              <Badge className="bg-indigo-600/30 text-indigo-300 border-0">Pro: {s.planDist.pro}</Badge>
              <Badge className="bg-amber-600/30 text-amber-300 border-0">Elite: {s.planDist.elite}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tenants */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-sm text-gray-400">Top 10 Tenants by Activity</CardTitle></CardHeader>
        <CardContent>
          {s.topTenants.length === 0 ? (
            <p className="text-sm text-gray-500">No tenant data yet.</p>
          ) : (
            <div className="space-y-2">
              {s.topTenants.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-5">{i + 1}</span>
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-gray-500">{t.city}</span>
                  </div>
                  <span className="text-indigo-400 font-mono text-xs">{t.recipes} recipes</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
