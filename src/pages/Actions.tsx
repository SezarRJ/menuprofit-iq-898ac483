import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Calendar, User, Plus } from "lucide-react";
import { toast } from "sonner";

interface Action {
  id: string; title: string; type: string; priority: string;
  status: string; due_date: string | null; assignee: string; notes: string;
}

const statusCols = ["new", "approved", "in_progress", "done", "cancelled"] as const;
const statusLabels: Record<string, Record<string, string>> = {
  ar: { new: "جديد", approved: "مُعتمد", in_progress: "قيد التنفيذ", done: "مكتمل", cancelled: "ملغي" },
  en: { new: "New", approved: "Approved", in_progress: "In Progress", done: "Done", cancelled: "Cancelled" },
};
const priorityColors: Record<string, string> = { high: "bg-destructive/15 text-destructive", medium: "bg-warning/15 text-warning", low: "bg-muted text-muted-foreground" };
const colColors: Record<string, string> = { new: "border-primary/30", approved: "border-success/30", in_progress: "border-warning/30", done: "border-success/50", cancelled: "border-muted" };

export default function Actions() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => { if (restaurant) load(); else setLoading(false); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("actions").select("*").eq("restaurant_id", restaurant!.id).order("created_at", { ascending: false });
    setActions((data ?? []) as Action[]);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!restaurant || !title) return;
    await supabase.from("actions").insert({
      restaurant_id: restaurant.id, title, type, priority, assignee,
      due_date: dueDate || null,
    });
    toast.success(isAr ? "تم الإنشاء" : "Created");
    setTitle(""); setAssignee(""); setDueDate(""); setOpen(false); load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("actions").update({ status }).eq("id", id);
    load();
  };

  if (loading) return <AppLayout><Skeleton className="h-96 rounded-2xl" /></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold flex items-center gap-2"><ClipboardList className="w-5 h-5" />{t("actions")}</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 me-2" />{t("add")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{isAr ? "إجراء جديد" : "New Action"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>{t("name")}</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div className="space-y-2"><Label>{isAr ? "الأولوية" : "Priority"}</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{isAr ? "عالية" : "High"}</SelectItem>
                      <SelectItem value="medium">{isAr ? "متوسطة" : "Medium"}</SelectItem>
                      <SelectItem value="low">{isAr ? "منخفضة" : "Low"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>{isAr ? "المسؤول" : "Assignee"}</Label><Input value={assignee} onChange={e => setAssignee(e.target.value)} /></div>
                <div className="space-y-2"><Label>{isAr ? "تاريخ الاستحقاق" : "Due Date"}</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} dir="ltr" /></div>
                <Button onClick={handleCreate} className="w-full rounded-xl">{t("save")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-5 gap-3 overflow-x-auto">
          {statusCols.map(col => {
            const colActions = actions.filter(a => a.status === col);
            return (
              <div key={col} className="min-w-[220px]">
                <div className={`text-sm font-medium mb-3 pb-2 border-b-2 ${colColors[col]}`}>
                  {statusLabels[lang]?.[col] || col} <Badge variant="secondary" className="ms-1 text-[10px]">{colActions.length}</Badge>
                </div>
                <div className="space-y-2">
                  {colActions.map(action => (
                    <Card key={action.id} className="cursor-pointer hover:shadow-card-hover transition-shadow">
                      <CardContent className="pt-3 pb-3 space-y-2">
                        <p className="text-sm font-medium leading-snug">{action.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] ${priorityColors[action.priority]}`}>{action.priority}</Badge>
                          <Badge variant="outline" className="text-[10px]">{action.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {action.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{action.due_date}</span>}
                          {action.assignee && <span className="flex items-center gap-1"><User className="w-3 h-3" />{action.assignee}</span>}
                        </div>
                        {col !== "done" && col !== "cancelled" && (
                          <div className="flex gap-1 mt-1">
                            {col === "new" && <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => updateStatus(action.id, "approved")}>{isAr ? "اعتماد" : "Approve"}</Button>}
                            {col === "approved" && <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => updateStatus(action.id, "in_progress")}>{isAr ? "بدء" : "Start"}</Button>}
                            {col === "in_progress" && <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => updateStatus(action.id, "done")}>{isAr ? "إنهاء" : "Done"}</Button>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
