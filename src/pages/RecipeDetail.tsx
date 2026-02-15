import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface RecipeDetail {
  id: string; name: string; category: string; selling_price: number;
  recipe_ingredients: { quantity: number; ingredients: { name: string; unit: string; unit_price: number } }[];
}

interface Competitor { id: string; competitor_name: string; price: number; note: string; }

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { restaurant } = useRestaurant();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [sellingPrice, setSellingPrice] = useState("");
  const [compName, setCompName] = useState("");
  const [compPrice, setCompPrice] = useState("");
  const [compNote, setCompNote] = useState("");
  const [compOpen, setCompOpen] = useState(false);
  const [weekSales, setWeekSales] = useState(0);
  const [overheadPerDish, setOverheadPerDish] = useState(0);

  useEffect(() => { if (id && restaurant) loadAll(); }, [id, restaurant]);

  const loadAll = async () => {
    const { data: r } = await supabase
      .from("recipes")
      .select("id, name, category, selling_price, recipe_ingredients(quantity, ingredients(name, unit, unit_price))")
      .eq("id", id!)
      .maybeSingle();
    if (r) {
      setRecipe(r as any);
      setSellingPrice(String(r.selling_price));
    }

    const { data: comps } = await supabase.from("competitor_prices").select("*").eq("recipe_id", id!);
    setCompetitors(comps ?? []);

    // Calculate overhead
    const { data: costs } = await supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant!.id);
    const { count } = await supabase.from("recipes").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurant!.id);
    const totalOp = costs?.reduce((s, c) => s + Number(c.monthly_amount), 0) ?? 0;
    setOverheadPerDish(totalOp / (count ?? 1));

    // Weekly sales (last 7 days from Saturday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const daysSinceSaturday = (dayOfWeek + 1) % 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() - daysSinceSaturday);
    saturday.setHours(0, 0, 0, 0);

    const { data: salesData } = await supabase
      .from("sales_rows")
      .select("quantity")
      .eq("matched_recipe_id", id!)
      .gte("sale_date", saturday.toISOString().split("T")[0]);

    setWeekSales(salesData?.reduce((s, r) => s + r.quantity, 0) ?? 0);
  };

  const updateSellingPrice = async () => {
    if (!recipe) return;
    await supabase.from("recipes").update({ selling_price: Number(sellingPrice) }).eq("id", recipe.id);
    toast.success("تم تحديث السعر");
    loadAll();
  };

  const addCompetitor = async () => {
    if (!compName || !compPrice) return;
    await supabase.from("competitor_prices").insert({
      recipe_id: id!, competitor_name: compName, price: Number(compPrice), note: compNote,
    });
    toast.success("تم الإضافة");
    setCompName(""); setCompPrice(""); setCompNote(""); setCompOpen(false);
    loadAll();
  };

  if (!recipe) return <AppLayout><div className="animate-fade-in p-8 text-center text-muted-foreground">جاري التحميل...</div></AppLayout>;

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";
  const ingredientCost = recipe.recipe_ingredients?.reduce(
    (s, ri) => s + ri.quantity * (ri.ingredients?.unit_price ?? 0), 0
  ) ?? 0;
  const trueCost = ingredientCost + overheadPerDish;
  const sp = Number(sellingPrice);
  const profit = sp - trueCost;
  const margin = sp > 0 ? (profit / sp) * 100 : 0;
  const breakeven = profit > 0 ? Math.ceil(
    (overheadPerDish * ((supabase as any)._recipes_count ?? 1)) / profit
  ) : 0;

  // Offer engine
  const getOffer = () => {
    // This would use volume_discount_rules in production
    if (weekSales === 0) return null;
    const discountPct = weekSales >= 300 ? 20 : weekSales >= 100 ? 10 : 0;
    if (discountPct === 0) return null;
    const newPrice = sp * (1 - discountPct / 100);
    const newMargin = sp > 0 ? ((newPrice - trueCost) / newPrice) * 100 : 0;
    const safe = newMargin >= 20;
    return { discountPct, newPrice, newMargin, safe };
  };

  const offer = getOffer();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">تفاصيل الصحن: {recipe.name}</h1>

        <Tabs defaultValue="cost">
          <TabsList>
            <TabsTrigger value="cost">التكلفة الحقيقية</TabsTrigger>
            <TabsTrigger value="pricing">التسعير ونقطة التعادل</TabsTrigger>
            <TabsTrigger value="competitors">أسعار المنافسين</TabsTrigger>
            <TabsTrigger value="offers">العروض المقترحة</TabsTrigger>
          </TabsList>

          <TabsContent value="cost">
            <Card className="shadow-card">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between py-2 border-b"><span>تكلفة المكونات</span><span className="font-bold">{ingredientCost.toFixed(2)}{currency}</span></div>
                <div className="flex justify-between py-2 border-b"><span>حصة المصاريف التشغيلية</span><span className="font-bold">{overheadPerDish.toFixed(2)}{currency}</span></div>
                <div className="flex justify-between py-2 text-lg"><span className="font-bold">التكلفة الحقيقية</span><span className="font-bold text-primary">{trueCost.toFixed(2)}{currency}</span></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="shadow-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-2">
                    <Label>سعر البيع الحالي ({currency})</Label>
                    <Input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} dir="ltr" className="text-left" step="0.01" />
                  </div>
                  <Button onClick={updateSellingPrice}>تحديث</Button>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">هامش الربح</p>
                    <p className={`text-xl font-bold ${margin >= 30 ? "text-success" : margin >= 15 ? "text-warning" : "text-destructive"}`}>{margin.toFixed(0)}%</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">الربح لكل صحن</p>
                    <p className="text-xl font-bold">{profit.toFixed(2)}{currency}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">نقطة التعادل</p>
                    <p className="text-xl font-bold">{breakeven.toLocaleString()} طبق</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex justify-end mb-4">
                  <Dialog open={compOpen} onOpenChange={setCompOpen}>
                    <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 ml-2" />إضافة منافس</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>إضافة منافس</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>اسم المنافس</Label><Input value={compName} onChange={e => setCompName(e.target.value)} /></div>
                        <div className="space-y-2"><Label>السعر ({currency})</Label><Input type="number" value={compPrice} onChange={e => setCompPrice(e.target.value)} dir="ltr" className="text-left" step="0.01" /></div>
                        <div className="space-y-2"><Label>ملاحظة</Label><Input value={compNote} onChange={e => setCompNote(e.target.value)} /></div>
                        <Button onClick={addCompetitor} className="w-full">حفظ</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>المنافس</TableHead><TableHead>السعر</TableHead><TableHead>ملاحظة</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {competitors.map(c => (
                      <TableRow key={c.id}><TableCell>{c.competitor_name}</TableCell><TableCell>{c.price}{currency}</TableCell><TableCell>{c.note}</TableCell></TableRow>
                    ))}
                    {competitors.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">لا يوجد منافسون بعد</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <Card className="shadow-card">
              <CardContent className="pt-6 space-y-4">
                <div className="bg-muted rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">المبيعات هذا الأسبوع:</span>
                  <span className="font-bold mr-2">{weekSales} طبق</span>
                </div>

                {offer ? (
                  <div className={`rounded-lg p-4 border-2 ${offer.safe ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {offer.safe ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
                      <span className="font-bold">{offer.safe ? "عرض آمن" : "تحذير: الخصم سيؤدي إلى خسارة"}</span>
                    </div>
                    <p>خصم مقترح الأسبوع القادم: <strong>{offer.discountPct}%</strong></p>
                    <p>السعر الجديد: <strong>{offer.newPrice.toFixed(2)}{currency}</strong></p>
                    <p>الهامش الجديد: <strong>{offer.newMargin.toFixed(0)}%</strong></p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">لا توجد اقتراحات حالياً. يتم تفعيل العروض بناءً على حجم المبيعات الأسبوعية.</p>
                )}

                <p className="text-xs text-muted-foreground">العروض توصيات فقط ولا تُطبق تلقائياً</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
