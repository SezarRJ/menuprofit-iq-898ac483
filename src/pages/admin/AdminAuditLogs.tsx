import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/admin-context";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

export default function AdminAuditLogs() {
  const { logAction } = useAdmin();
  const [platformLogs, setPlatformLogs] = useState<any[]>([]);
  const [tenantLogs, setTenantLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exportModal, setExportModal] = useState(false);
  const [exportReason, setExportReason] = useState("");

  useEffect(() => {
    const load = async () => {
      const [pRes, tRes] = await Promise.all([
        supabase.from("platform_audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      setPlatformLogs(pRes.data || []);
      setTenantLogs(tRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleExport = async () => {
    if (!exportReason.trim() || exportReason.length < 5) { toast.error("Reason required (min 5 chars)."); return; }
    await logAction("export_audit_logs", "audit_logs", "all", exportReason);
    toast.success("Export logged. Download initiated.");
    setExportModal(false);
    setExportReason("");
  };

  const filterLogs = (logs: any[]) =>
    logs.filter(l => JSON.stringify(l).toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-500" />
          </div>
          <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => { setExportModal(true); setExportReason(""); }}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="platform">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="platform">Platform Logs ({platformLogs.length})</TabsTrigger>
          <TabsTrigger value="tenant">Tenant Logs ({tenantLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <Card className="bg-white/5 border-white/10 mt-2">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-400">Time</TableHead>
                    <TableHead className="text-gray-400">Action</TableHead>
                    <TableHead className="text-gray-400">Target</TableHead>
                    <TableHead className="text-gray-400">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterLogs(platformLogs).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">No logs.</TableCell></TableRow>
                  ) : filterLogs(platformLogs).map(l => (
                    <TableRow key={l.id} className="border-white/5">
                      <TableCell className="text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{l.action}</TableCell>
                      <TableCell className="text-xs text-gray-400">{l.target_type} / {l.target_id?.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs">{l.reason || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant">
          <Card className="bg-white/5 border-white/10 mt-2">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-400">Time</TableHead>
                    <TableHead className="text-gray-400">Action</TableHead>
                    <TableHead className="text-gray-400">Entity</TableHead>
                    <TableHead className="text-gray-400">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterLogs(tenantLogs).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">No logs.</TableCell></TableRow>
                  ) : filterLogs(tenantLogs).map(l => (
                    <TableRow key={l.id} className="border-white/5">
                      <TableCell className="text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{l.action}</TableCell>
                      <TableCell className="text-xs text-gray-400">{l.entity_type}</TableCell>
                      <TableCell className="font-mono text-xs">{l.entity_id?.slice(0, 8)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={exportModal} onOpenChange={setExportModal}>
        <DialogContent className="bg-[#1a1a3e] border-white/10 text-gray-100">
          <DialogHeader><DialogTitle>Export Audit Logs</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-400">A reason is required for all audit log exports.</p>
          <Textarea placeholder="Reason..." value={exportReason} onChange={e => setExportReason(e.target.value)} className="bg-white/5 border-white/10 text-gray-100" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExportModal(false)} className="text-gray-400">Cancel</Button>
            <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700">Confirm Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
