import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/admin-context";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotifications() {
  const { userId, logAction } = useAdmin();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", target_plan: "", channel: "email" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("platform_notifications").select("*").order("created_at", { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  };

  const create = async () => {
    if (!form.title.trim()) { toast.error("Title required."); return; }
    await supabase.from("platform_notifications").insert({
      title: form.title,
      body: form.body,
      target_plan: form.target_plan || null,
      channel: form.channel,
      created_by: userId!,
    });
    await logAction("create_notification", "notification", "", "Created campaign: " + form.title);
    toast.success("Notification created.");
    setCreateModal(false);
    setForm({ title: "", body: "", target_plan: "", channel: "email" });
    load();
  };

  const statusColor: Record<string, string> = {
    draft: "bg-gray-600/20 text-gray-400",
    sent: "bg-emerald-600/20 text-emerald-400",
    scheduled: "bg-indigo-600/20 text-indigo-400",
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button onClick={() => setCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Channel</TableHead>
                <TableHead className="text-gray-400">Target</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Sent</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-12">Loading...</TableCell></TableRow>
              ) : notifications.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-12">No notifications yet.</TableCell></TableRow>
              ) : notifications.map(n => (
                <TableRow key={n.id} className="border-white/5">
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell className="text-sm text-gray-400">{n.channel}</TableCell>
                  <TableCell className="text-sm">{n.target_plan || "All"}</TableCell>
                  <TableCell><Badge className={`${statusColor[n.status] || statusColor.draft} border-0`}>{n.status}</Badge></TableCell>
                  <TableCell className="text-sm">{n.sent_count}</TableCell>
                  <TableCell className="text-xs text-gray-500">{new Date(n.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="bg-[#1a1a3e] border-white/10 text-gray-100">
          <DialogHeader><DialogTitle>New Notification Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-white/5 border-white/10 text-gray-100" />
            <Textarea placeholder="Body" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="bg-white/5 border-white/10 text-gray-100" />
            <Select value={form.target_plan} onValueChange={v => setForm({ ...form, target_plan: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-gray-100"><SelectValue placeholder="Target Plan (all)" /></SelectTrigger>
              <SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="pro">Pro</SelectItem><SelectItem value="elite">Elite</SelectItem></SelectContent>
            </Select>
            <Select value={form.channel} onValueChange={v => setForm({ ...form, channel: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-gray-100"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="push">Push</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem></SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateModal(false)} className="text-gray-400">Cancel</Button>
            <Button onClick={create} className="bg-indigo-600 hover:bg-indigo-700"><Send className="w-4 h-4 mr-2" /> Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
