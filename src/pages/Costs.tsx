import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Cost {
  id: string;
  name: string;
  cost_type: string;
  monthly_amount: number;
}

export default function Costs() {
  const { restaurant } = useRestaurant();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cost | null>(null);
  const [name, setName] = useState("");
  const [costType, setCostType] = useState("fixed");
  const [amount, setAmount] = useState("");

  useEffect(() => { if (restaurant) load(); }, [restaurant]);

  const load = async () => {
    const { data } = await supabase.from("operating_costs").select("*").eq("restaurant_id", restaurant!.id).order("created_at");
    setCosts(data ?? []);
  };

  const handleSave = async () => {
    if (!restaurant || !name || !amount) return;
    if (editing) {
      await supabase.from("operating_costs").update({ name, cost_type: costType, monthly_amount: Number(amount) }).eq("id", editing.id);
    } else {
      await supabase.from("operating_costs").insert({ restaurant_id: restaurant.id, name, cost_type: costType, monthly_amount: Number(amount) });
    }
    toast.success("تم الحفظ");
    reset();
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("operating_costs").delete().eq("id", id);
    toast.success("تم الحذف");
    load();
  };

  const openEdit = (c: Cost) => {
    setEditing(c); setName(c.name); setCostType(c.cost_type); setAmount(String(c.monthly_amount)); setOpen(true);
  };

  const reset = () => { setEditing(null); setName(""); setCostType("fixed"); setAmount(""); setOpen(false); };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";
  const fixed = costs.filter(c => c.cost_type === "fixed");
  const variable = costs.filter(c => c.cost_type === "variable");
  const total = costs.reduce((s, c) => s + c.monthly_amount, 0);

  const renderTable = (items: Cost[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>البند</TableHead>
          <TableHead>النوع</TableHead>
          <TableHead>المبلغ الشهري</TableHead>
          <TableHead className="w-24">تعديل</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(c => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>{c.cost_type === "fixed" ? "ثابت" : "متغير"}</TableCell>
            <TableCell>{c.monthly_amount.toLocaleString()}{currency}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">لا توجد مصاريف بعد</TableCell></TableRow>}
      </TableBody>
    </Table>
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">المصاريف التشغيلية الشهرية</h1>
          <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); else setOpen(true); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" />إضافة مصروف جديد</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "تعديل المصروف" : "إضافة مصروف جديد"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>البند</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>النوع</Label>
                  <Select value={costType} onValueChange={setCostType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="fixed">ثابت</SelectItem><SelectItem value="variable">متغير</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>المبلغ الشهري ({currency})</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} dir="ltr" className="text-left" /></div>
                <Button onClick={handleSave} className="w-full">حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="fixed">
          <TabsList>
            <TabsTrigger value="fixed">تكاليف ثابتة</TabsTrigger>
            <TabsTrigger value="variable">تكاليف متغيرة</TabsTrigger>
          </TabsList>
          <TabsContent value="fixed"><Card className="shadow-card"><CardContent className="p-0">{renderTable(fixed)}</CardContent></Card></TabsContent>
          <TabsContent value="variable"><Card className="shadow-card"><CardContent className="p-0">{renderTable(variable)}</CardContent></Card></TabsContent>
        </Tabs>

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="font-bold">إجمالي المصاريف الشهرية</span>
          <span className="text-xl font-bold text-primary">{total.toLocaleString()}{currency}</span>
        </div>
        <p className="text-sm text-muted-foreground">هذه المصاريف سيتم تحميلها على الأطباق لحساب التكلفة الحقيقية</p>
      </div>
    </AppLayout>
  );
}
