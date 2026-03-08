import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/admin-context";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminFeatureFlags() {
  const { logAction } = useAdmin();
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("platform_feature_flags").select("*").order("created_at", { ascending: false });
    setFlags(data || []);
    setLoading(false);
  };

  const createFlag = async () => {
    if (!newKey.trim() || !reason.trim()) { toast.error("Key and reason required."); return; }
    await supabase.from("platform_feature_flags").insert({ key: newKey.trim(), description: newDesc.trim() });
    await logAction("create_flag", "feature_flag", newKey.trim(), reason);
    toast.success("Flag created.");
    setCreateModal(false);
    setNewKey(""); setNewDesc(""); setReason("");
    load();
  };

  const toggleFlag = async (flag: any) => {
    const newVal = !flag.default_enabled;
    await supabase.from("platform_feature_flags").update({ default_enabled: newVal }).eq("id", flag.id);
    await logAction("toggle_flag", "feature_flag", flag.key, `Toggled to ${newVal}`, { default_enabled: flag.default_enabled }, { default_enabled: newVal });
    toast.success(`${flag.key} ${newVal ? "enabled" : "disabled"} globally.`);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Feature Flags</h1>
        <Button onClick={() => setCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Flag
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Key</TableHead>
                <TableHead className="text-gray-400">Description</TableHead>
                <TableHead className="text-gray-400">Default</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-12">Loading...</TableCell></TableRow>
              ) : flags.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-12">No flags defined.</TableCell></TableRow>
              ) : flags.map(f => (
                <TableRow key={f.id} className="border-white/5">
                  <TableCell className="font-mono text-sm">{f.key}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{f.description}</TableCell>
                  <TableCell>
                    <span className={f.default_enabled ? "text-emerald-400" : "text-gray-600"}>
                      {f.default_enabled ? "ON" : "OFF"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleFlag(f)}>Toggle</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="bg-[#1a1a3e] border-white/10 text-gray-100">
          <DialogHeader><DialogTitle>Create Feature Flag</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Flag key (e.g. advanced_promotions)" value={newKey} onChange={e => setNewKey(e.target.value)} className="bg-white/5 border-white/10 text-gray-100" />
            <Input placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-white/5 border-white/10 text-gray-100" />
            <Textarea placeholder="Reason (required)" value={reason} onChange={e => setReason(e.target.value)} className="bg-white/5 border-white/10 text-gray-100" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateModal(false)} className="text-gray-400">Cancel</Button>
            <Button onClick={createFlag} className="bg-indigo-600 hover:bg-indigo-700"><Save className="w-4 h-4 mr-2" /> Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
