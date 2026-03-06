import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

const units = ["كغم", "غرام", "لتر", "مل", "قطعة", "علبة", "كيس"];

interface Ingredient {
  id: string; name: string; unit: string; unit_price: number;
}

export default function DataHubIngredients() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(!!searchParams.get("add"));
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("كغم");
  const [price, setPrice] = useState("");

  useEffect(() => { if (restaurant) load(); else setLoading(false); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("ingredients").select("*").eq("restaurant_id", restaurant!.id).order("created_at");
    setItems(data ?? []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!restaurant || !name || !price) return;
    if (editing) {
      await supabase.from("ingredients").update({ name, unit, unit_price: Number(price) }).eq("id", editing.id);
    } else {
      await supabase.from("ingredients").insert({ restaurant_id: restaurant.id, name, unit, unit_price: Number(price) });
    }
    toast.success(isAr ? "تم الحفظ" : "Saved");
    reset(); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ingredients").delete().eq("id", id);
    toast.success(isAr ? "تم الحذف" : "Deleted"); load();
  };

  const openEdit = (i: Ingredient) => {
    setEditing(i); setName(i.name); setUnit(i.unit); setPrice(String(i.unit_price)); setOpen(true);
  };

  const reset = () => { setEditing(null); setName(""); setUnit("كغم"); setPrice(""); setOpen(false); };
  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  if (loading) {
    return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("ingredients")}</h1>
          <Dialog open={open} onOpenChange={v => { if (!v) reset(); else setOpen(true); }}>
            <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 me-2" />{t("add")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? t("edit") : t("add")} {t("ingredients")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>{t("name")}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>{t("unit")}</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>{t("price")} ({currency})</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} dir="ltr" className="text-left" step="0.01" /></div>
                <Button onClick={handleSave} className="w-full rounded-xl">{t("save")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-card rounded-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("unit")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  <TableHead className="w-24">{t("edit")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.unit}</TableCell>
                    <TableCell>{i.unit_price.toLocaleString()} {currency}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-12">
                    <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">{t("noData")}</p>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
