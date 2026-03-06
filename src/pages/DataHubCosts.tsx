import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Calculator, Save } from "lucide-react";
import { toast } from "sonner";

interface CostItem { id: string; name: string; cost_type: string; monthly_amount: number; }

export default function DataHubCosts({ costType }: { costType: "operating" | "fixed" | "hidden" }) {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [items, setItems] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CostItem | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const tableName = costType === "operating" ? "operating_costs" : costType === "fixed" ? "fixed_costs" : "hidden_costs";
  const pageTitle = costType === "operating" ? t("operatingCosts") : costType === "fixed" ? t("fixedCosts") : t("hiddenCosts");

  useEffect(() => { if (restaurant) load(); else setLoading(false); }, [restaurant, costType]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(tableName).select("*").eq("restaurant_id", restaurant!.id).order("created_at");
    setItems((data ?? []).map((d: any) => ({ id: d.id, name: d.name, cost_type: d.cost_type || d.category || costType, monthly_amount: Number(d.monthly_amount) })));
    setLoading(false);
  };

  const handleSave = async () => {
    if (!restaurant || !name || !amount) return;
    const record: any = { name, monthly_amount: Number(amount) };
    if (costType === "operating") record.cost_type = "variable";
    if (costType === "fixed") record.category = "fixed";
    if (costType === "hidden") record.category = "hidden";

    if (editing) {
      await supabase.from(tableName).update(record).eq("id", editing.id);
    } else {
      record.restaurant_id = restaurant.id;
      await supabase.from(tableName).insert(record);
    }
    toast.success(isAr ? "تم الحفظ" : "Saved");
    reset(); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from(tableName).delete().eq("id", id);
    toast.success(isAr ? "تم الحذف" : "Deleted"); load();
  };

  const reset = () => { setEditing(null); setName(""); setAmount(""); setOpen(false); };
  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";
  const total = items.reduce((s, c) => s + c.monthly_amount, 0);

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
          <Dialog open={open} onOpenChange={v => { if (!v) reset(); else setOpen(true); }}>
            <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 me-2" />{t("add")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? t("edit") : t("add")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>{t("name")}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>{isAr ? "المبلغ الشهري" : "Monthly Amount"} ({currency})</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} dir="ltr" step="0.01" /></div>
                <Button onClick={handleSave} className="w-full rounded-xl">{t("save")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total */}
        <Card className="rounded-2xl shadow-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Calculator className="w-6 h-6 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">{isAr ? "الإجمالي الشهري" : "Monthly Total"}</p>
              <p className="text-2xl font-extrabold">{total.toLocaleString()} {currency}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card rounded-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{isAr ? "المبلغ الشهري" : "Monthly"}</TableHead>
                  <TableHead className="w-24">{t("edit")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.monthly_amount.toLocaleString()} {currency}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setName(c.name); setAmount(String(c.monthly_amount)); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground">{t("noData")}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
