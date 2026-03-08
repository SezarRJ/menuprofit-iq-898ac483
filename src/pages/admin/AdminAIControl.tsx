import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle } from "lucide-react";

export default function AdminAIControl() {
  const [totalCalls, setTotalCalls] = useState(0);
  const [todayCalls, setTodayCalls] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [totalRes, todayRes] = await Promise.all([
        supabase.from("ai_usage_logs").select("id", { count: "exact", head: true }),
        supabase.from("ai_usage_logs").select("id", { count: "exact", head: true }).gte("created_at", today),
      ]);
      setTotalCalls(totalRes.count || 0);
      setTodayCalls(todayRes.count || 0);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">AI Control Center</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-5 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <div>
              <p className="text-2xl font-bold">{loading ? "—" : totalCalls}</p>
              <p className="text-xs text-gray-500">Total AI Calls</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-5 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-2xl font-bold">{loading ? "—" : todayCalls}</p>
              <p className="text-xs text-gray-500">Today's Calls</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500">Errors Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-sm text-gray-400">Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Status</span><Badge className="bg-emerald-600/20 text-emerald-400 border-0">Active</Badge></div>
            <div className="flex justify-between"><span className="text-gray-400">Provider</span><span>Lovable AI Gateway</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Default Model</span><span className="font-mono text-xs">gemini-2.5-flash</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Monthly Cap</span><span>100,000 tokens</span></div>
            <p className="text-xs text-gray-600 mt-4">Provider keys are stored securely in backend secrets. Never exposed client-side.</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-sm text-gray-400">Prompt Templates</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">pricing_prompt</span><Badge className="bg-indigo-600/20 text-indigo-300 border-0 text-xs">v1</Badge></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">promotion_prompt</span><Badge className="bg-indigo-600/20 text-indigo-300 border-0 text-xs">v1</Badge></div>
            <div className="flex justify-between py-1"><span className="text-gray-400">menu_opt_prompt</span><Badge className="bg-indigo-600/20 text-indigo-300 border-0 text-xs">v1</Badge></div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
