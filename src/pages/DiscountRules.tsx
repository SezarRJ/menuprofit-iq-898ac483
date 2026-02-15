import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Rule { id: string; min_weekly_volume: number; discount_pct: number; min_margin_pct: number; }

export default function DiscountRules() {
  const { restaurant } = useRestaurant();
  const [rules, setRules] = useState<Rule[]>([]);
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState("");
  const [discount, setDiscount] = useState("");
  const [minMargin, setMinMargin] = useState("");

  useEffect(() => { if (restaurant) load(); }, [restaurant]);

  const load = async () => {
    const { data } = await supabase.from("volume_discount_rules").select("*").eq("restaurant_id", restaurant!.id).order("min_weekly_volume");
    setRules(data ?? []);
  };

  const handleSave = async () => {
    if (!restaurant || !volume || !discount || !minMargin) return;
    await supabase.from("volume_discount_rules").insert({
      restaurant_id: restaurant.id, min_weekly_volume: Number(volume), discount_pct: Number(discount), min_margin_pct: Number(minMargin),
    });
    toast.success("تم الحفظ");
    setVolume(""); setDiscount(""); setMinMargin(""); setOpen(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("volume_discount_rules").delete().eq("id", id);
    toast.success("تم الحذف"); load();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">قواعد الخصومات المقترحة</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 ml-2" />إضافة قاعدة</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>إضافة قاعدة خصم</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>عند تجاوز (طبق/أسبوع)</Label><Input type="number" value={volume} onChange={e => setVolume(e.target.value)} dir="ltr" className="text-left" /></div>
                <div className="space-y-2"><Label>الخصم %</Label><Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} dir="ltr" className="text-left" /></div>
                <div className="space-y-2"><Label>الحد الأدنى للهامش %</Label><Input type="number" value={minMargin} onChange={e => setMinMargin(e.target.value)} dir="ltr" className="text-left" /></div>
                <Button onClick={handleSave} className="w-full">حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عند تجاوز</TableHead>
                  <TableHead>الخصم</TableHead>
                  <TableHead>الحد الأدنى للهامش</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.min_weekly_volume} طبق/أسبوع</TableCell>
                    <TableCell>{r.discount_pct}%</TableCell>
                    <TableCell>≥{r.min_margin_pct}%</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
                {rules.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">لا توجد قواعد بعد</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">العروض توصيات فقط ولا تُطبق تلقائياً</p>
      </div>
    </AppLayout>
  );
}
