import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/admin-context";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Tenant {
  id: string;
  name: string;
  city: string;
  created_at: string;
  plan: string;
  status: string;
}

export default function AdminTenants() {
  const { logAction } = useAdmin();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ open: boolean; tenant: Tenant | null; action: string }>({ open: false, tenant: null, action: "" });
  const [reason, setReason] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: restaurants } = await supabase.from("restaurants").select("id, name, city, created_at");
    const { data: subs } = await supabase.from("subscriptions").select("restaurant_id, plan, status");
    const subMap = new Map((subs || []).map(s => [s.restaurant_id, s]));
    
    setTenants((restaurants || []).map(r => ({
      ...r,
      plan: subMap.get(r.id)?.plan || "free",
      status: subMap.get(r.id)?.status || "active",
    })));
    setLoading(false);
  };

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async () => {
    if (!reason.trim() || reason.length < 5) {
      toast.error("Reason is required (min 5 chars).");
      return;
    }
    const t = actionModal.tenant!;
    const action = actionModal.action;

    await logAction(action, "tenant", t.id, reason, { status: t.status }, { status: action === "suspend" ? "suspended" : "active" });
    toast.success(`Tenant ${action}ed.`);
    setActionModal({ open: false, tenant: null, action: "" });
    setReason("");
    load();
  };

  const planColor: Record<string, string> = {
    free: "bg-gray-600/30 text-gray-300",
    pro: "bg-indigo-600/30 text-indigo-300",
    elite: "bg-amber-600/30 text-amber-300",
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search tenants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-500"
          />
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">City</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-12">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-12">No tenants found.</TableCell></TableRow>
              ) : filtered.map(t => (
                <TableRow key={t.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-gray-400">{t.city}</TableCell>
                  <TableCell><Badge className={`${planColor[t.plan] || planColor.free} border-0`}>{t.plan}</Badge></TableCell>
                  <TableCell>
                    <Badge className={t.status === "active" ? "bg-emerald-600/20 text-emerald-400 border-0" : "bg-red-600/20 text-red-400 border-0"}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Link to={`/admin/tenants/${t.id}`}>
                        <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 h-7 px-2">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={t.status === "active" ? "text-red-400 hover:text-red-300 h-7 px-2 text-xs" : "text-emerald-400 hover:text-emerald-300 h-7 px-2 text-xs"}
                        onClick={() => {
                          setActionModal({ open: true, tenant: t, action: t.status === "active" ? "suspend" : "resume" });
                          setReason("");
                        }}
                      >
                        {t.status === "active" ? "Suspend" : "Resume"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={actionModal.open} onOpenChange={o => setActionModal({ ...actionModal, open: o })}>
        <DialogContent className="bg-[#1a1a3e] border-white/10 text-gray-100">
          <DialogHeader>
            <DialogTitle>
              {actionModal.action === "suspend" ? "Suspend" : "Resume"} Tenant: {actionModal.tenant?.name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for this action (required)..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="bg-white/5 border-white/10 text-gray-100 min-h-[80px]"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionModal({ open: false, tenant: null, action: "" })} className="text-gray-400">Cancel</Button>
            <Button onClick={handleAction} className={actionModal.action === "suspend" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
