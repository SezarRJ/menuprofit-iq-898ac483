import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const units = ["كغم", "غرام", "لتر", "مل", "قطعة", "علبة", "كيس"];

interface Ingredient {
  id: string; name: string; unit: string; unit_price: number;
}

export default function Ingredients() {
  const { restaurant } = useRestaurant();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [open, setOpen] = useState(!!searchParams.get("add"));
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("كغم");
  const [price, setPrice] = useState("");

  useEffect(() => { if (restaurant) load(); }, [restaurant]);

  const load = async () => {
    const { data } = await supabase.from("ingredients").select("*").eq("restaurant_id", restaurant!.id).order("created_at");
    setItems(data ?? []);
  };

  const handleSave = async () => {
    if (!restaurant || !name || !price) return;
    if (editing) {
      await supabase.from("ingredients").update({ name, unit, unit_price: Number(price) }).eq("id", editing.id);
    } else {
      await supabase.from("ingredients").insert({ restaurant_id: restaurant.id, name, unit, unit_price: Number(price) });
    }
    toast.success("تم الحفظ");
    reset(); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ingredients").delete().eq("id", id);
    toast.success("تم الحذف"); load();
  };

  const openEdit = (i: Ingredient) => {
    setEditing(i); setName(i.name); setUnit(i.unit); setPrice(String(i.unit_price)); setOpen(true);
  };

  const reset = () => { setEditing(null); setName(""); setUnit("كغم"); setPrice(""); setOpen(false); };
  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">المواد الخام</h1>
          <Dialog open={open} onOpenChange={v => { if (!v) reset(); else setOpen(true); }}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 ml-2" />إضافة مادة خام</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "تعديل المادة" : "إضافة مادة خام"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>اسم المادة</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>وحدة القياس</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>سعر الشراء لكل وحدة ({currency})</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} dir="ltr" className="text-left" step="0.01" /></div>
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
                  <TableHead>المادة</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead>سعر الوحدة</TableHead>
                  <TableHead className="w-24">تعديل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.unit}</TableCell>
                    <TableCell>{i.unit_price}{currency}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">لا توجد مواد خام بعد</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
