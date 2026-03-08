import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/admin-context";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminTenantDetail() {
  const { id } = useParams<{ id: string }>();
  const { logAction } = useAdmin();
  const [tenant, setTenant] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [usage, setUsage] = useState<any>({});
  const [limits, setLimits] = useState<any>(null);
  const [flags, setFlags] = useState<any[]>([]);
  const [globalFlags, setGlobalFlags] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    const [rRes, sRes, iRes, recRes, aiRes, limRes, ffRes, gfRes, alRes, impRes] = await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id!).single(),
      supabase.from("subscriptions").select("*").eq("restaurant_id", id!).maybeSingle(),
      supabase.from("ingredients").select("id", { count: "exact", head: true }).eq("restaurant_id", id!),
      supabase.from("recipes").select("id", { count: "exact", head: true }).eq("restaurant_id", id!),
      supabase.from("ai_usage_logs").select("id", { count: "exact", head: true }).eq("restaurant_id", id!).gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from("tenant_limits").select("*").eq("tenant_id", id!).maybeSingle(),
      supabase.from("tenant_feature_flags").select("*").eq("tenant_id", id!),
      supabase.from("platform_feature_flags").select("*"),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("sales_imports").select("*").eq("restaurant_id", id!).order("uploaded_at", { ascending: false }).limit(20),
    ]);

    setTenant(rRes.data);
    setSub(sRes.data);
    setUsage({ ingredients: iRes.count || 0, recipes: recRes.count || 0, aiCalls: aiRes.count || 0 });
    setLimits(limRes.data || { ingredients_limit: 30, recipes_limit: 20, inventory_limit: 0, ai_monthly_quota: 0, imports_limit: 5 });
    setFlags(ffRes.data || []);
    setGlobalFlags(gfRes.data || []);
    setAuditLogs(alRes.data || []);
    setImports(impRes.data || []);
    setLoading(false);
  };

  const saveLimits = async () => {
    const { data: existing } = await supabase.from("tenant_limits").select("id").eq("tenant_id", id!).maybeSingle();
    if (existing) {
      await supabase.from("tenant_limits").update(limits).eq("tenant_id", id!);
    } else {
      await supabase.from("tenant_limits").insert({ ...limits, tenant_id: id! });
    }
    await logAction("update_limits", "tenant", id!, "Updated tenant limits", {}, limits);
    toast.success("Limits saved.");
  };

  const toggleFlag = async (key: string, enabled: boolean) => {
    const existing = flags.find(f => f.flag_key === key);
    if (existing) {
      await supabase.from("tenant_feature_flags").update({ enabled }).eq("id", existing.id);
    } else {
      await supabase.from("tenant_feature_flags").insert({ tenant_id: id!, flag_key: key, enabled });
    }
    await logAction("toggle_flag", "tenant", id!, `Set ${key} = ${enabled}`, {}, { flag_key: key, enabled });
    toast.success(`Flag ${key} ${enabled ? "enabled" : "disabled"}.`);
    load();
  };

  if (loading) {
    return <AdminLayout><Skeleton className="h-64 bg-white/10" /></AdminLayout>;
  }

  if (!tenant) {
    return <AdminLayout><p className="text-gray-500">Tenant not found.</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{tenant.name}</h1>
        <Badge className="bg-indigo-600/30 text-indigo-300 border-0">{sub?.plan || "free"}</Badge>
        <Badge className={sub?.status === "active" ? "bg-emerald-600/20 text-emerald-400 border-0" : "bg-red-600/20 text-red-400 border-0"}>
          {sub?.status || "active"}
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="limits">Plan & Limits</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="imports">Imports</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <Card className="bg-white/5 border-white/10"><CardContent className="pt-5">
              <p className="text-xs text-gray-500">City</p><p className="font-medium">{tenant.city}</p>
            </CardContent></Card>
            <Card className="bg-white/5 border-white/10"><CardContent className="pt-5">
              <p className="text-xs text-gray-500">Currency</p><p className="font-medium">{tenant.default_currency}</p>
            </CardContent></Card>
            <Card className="bg-white/5 border-white/10"><CardContent className="pt-5">
              <p className="text-xs text-gray-500">Created</p><p className="font-medium">{new Date(tenant.created_at).toLocaleDateString()}</p>
            </CardContent></Card>
            <Card className="bg-white/5 border-white/10"><CardContent className="pt-5">
              <p className="text-xs text-gray-500">Ingredients</p><p className="text-xl font-bold text-indigo-400">{usage.ingredients}</p>
            </CardContent></Card>
            <Card className="bg-white/5 border-white/10"><CardContent className="pt-5">
              <p className="text-xs text-gray-500">Recipes</p><p className="text-xl font-bold text-indigo-400">{usage.recipes}</p>
            </CardContent></Card>
            <Card className="bg-white/5 border-white/10"><CardContent className="pt-5">
              <p className="text-xs text-gray-500">AI Calls (Month)</p><p className="text-xl font-bold text-violet-400">{usage.aiCalls}</p>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="limits">
          <Card className="bg-white/5 border-white/10 mt-4">
            <CardContent className="pt-6 space-y-4">
              {["ingredients_limit", "recipes_limit", "inventory_limit", "ai_monthly_quota", "imports_limit"].map(key => (
                <div key={key} className="flex items-center gap-4">
                  <label className="w-40 text-sm text-gray-400">{key.replace(/_/g, " ")}</label>
                  <Input
                    type="number"
                    value={limits[key] || 0}
                    onChange={e => setLimits({ ...limits, [key]: parseInt(e.target.value) || 0 })}
                    className="w-32 bg-white/5 border-white/10 text-gray-100"
                  />
                </div>
              ))}
              <Button onClick={saveLimits} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" /> Save Limits
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags">
          <Card className="bg-white/5 border-white/10 mt-4">
            <CardContent className="pt-6">
              {globalFlags.length === 0 ? (
                <p className="text-gray-500 text-sm">No feature flags defined yet. Create them in Feature Flags page.</p>
              ) : (
                <div className="space-y-3">
                  {globalFlags.map(gf => {
                    const override = flags.find(f => f.flag_key === gf.key);
                    const enabled = override ? override.enabled : gf.default_enabled;
                    return (
                      <div key={gf.key} className="flex items-center justify-between py-2 border-b border-white/5">
                        <div>
                          <p className="text-sm font-medium">{gf.key}</p>
                          <p className="text-xs text-gray-500">{gf.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {override && <Badge className="bg-indigo-600/20 text-indigo-300 border-0 text-xs">Override</Badge>}
                          <Button
                            size="sm"
                            variant="ghost"
                            className={enabled ? "text-emerald-400 h-7" : "text-gray-500 h-7"}
                            onClick={() => toggleFlag(gf.key, !enabled)}
                          >
                            {enabled ? "ON" : "OFF"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imports">
          <Card className="bg-white/5 border-white/10 mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10"><TableHead className="text-gray-400">File</TableHead><TableHead className="text-gray-400">Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {imports.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center text-gray-500 py-8">No imports.</TableCell></TableRow>
                  ) : imports.map(imp => (
                    <TableRow key={imp.id} className="border-white/5">
                      <TableCell>{imp.file_name}</TableCell>
                      <TableCell className="text-xs text-gray-500">{new Date(imp.uploaded_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="bg-white/5 border-white/10 mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-400">Time</TableHead>
                    <TableHead className="text-gray-400">Action</TableHead>
                    <TableHead className="text-gray-400">Entity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-gray-500 py-8">No logs.</TableCell></TableRow>
                  ) : auditLogs.map(log => (
                    <TableRow key={log.id} className="border-white/5">
                      <TableCell className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="text-xs">{log.entity_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
