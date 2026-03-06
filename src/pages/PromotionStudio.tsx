import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Sparkles, Plus, TrendingUp, Calendar, Target, Percent, Share2 } from "lucide-react";
import { toast } from "sonner";

interface Promotion {
  id: string; title: string; type: string; description: string;
  suggested_price: number; expected_margin: number; attractiveness: string;
  timing: string; reason: string; status: string;
}

export default function PromotionStudio() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("bundle");
  const [price, setPrice] = useState("");

  useEffect(() => { if (restaurant) load(); else setLoading(false); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("promotions").select("*").eq("restaurant_id", restaurant!.id).order("created_at", { ascending: false });
    setPromos((data ?? []) as Promotion[]);
    setLoading(false);
  };

  const generateAIPromos = async () => {
    setGenerating(true);
    try {
      const { data: recipes } = await supabase
        .from("recipes")
        .select("name, category, selling_price, recipe_ingredients(quantity, ingredients(unit_price, name))")
        .eq("restaurant_id", restaurant!.id);

      if (!recipes || recipes.length < 2) {
        toast.error(isAr ? "أضف وصفتين على الأقل" : "Add at least 2 recipes");
        setGenerating(false);
        return;
      }

      // Generate rule-based promos
      const highMargin = recipes.filter(r => {
        const cost = r.recipe_ingredients?.reduce((s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0) ?? 0;
        const margin = Number(r.selling_price) > 0 ? ((Number(r.selling_price) - cost) / Number(r.selling_price)) * 100 : 0;
        return margin > 40;
      });

      const bundles: any[] = [];
      for (let i = 0; i < Math.min(highMargin.length, 3); i++) {
        const r1 = highMargin[i];
        const r2 = highMargin[(i + 1) % highMargin.length];
        if (r1 && r2 && r1.name !== r2.name) {
          const bundlePrice = Math.round((Number(r1.selling_price) + Number(r2.selling_price)) * 0.85);
          bundles.push({
            restaurant_id: restaurant!.id,
            title: `${r1.name} + ${r2.name}`,
            type: "bundle",
            description: isAr ? `باقة مكونة من ${r1.name} و ${r2.name}` : `Bundle of ${r1.name} and ${r2.name}`,
            suggested_price: bundlePrice,
            expected_margin: 25,
            attractiveness: "high",
            timing: isAr ? "طوال الأسبوع" : "All week",
            reason: isAr ? "وصفات ذات هوامش عالية - خصم 15% آمن" : "High margin recipes - 15% discount is safe",
            status: "draft",
          });
        }
      }

      if (bundles.length > 0) {
        await supabase.from("promotions").insert(bundles);
        toast.success(isAr ? `تم توليد ${bundles.length} عروض` : `Generated ${bundles.length} promotions`);
        load();
      } else {
        toast.info(isAr ? "لا توجد فرص كافية" : "Not enough opportunities");
      }
    } catch (err) {
      toast.error(isAr ? "خطأ في التوليد" : "Generation error");
    }
    setGenerating(false);
  };

  const handleCreate = async () => {
    if (!restaurant || !title || !price) return;
    await supabase.from("promotions").insert({
      restaurant_id: restaurant.id, title, type, suggested_price: Number(price),
      expected_margin: 0, status: "draft",
    });
    toast.success(isAr ? "تم الإنشاء" : "Created");
    setTitle(""); setPrice(""); setOpen(false); load();
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";
  const typeColors: Record<string, string> = { bundle: "bg-success/10 text-success", combo: "bg-primary/10 text-primary", seasonal: "bg-warning/10 text-warning", discount: "bg-destructive/10 text-destructive" };

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("promotionStudio")}</h1>
          <div className="flex gap-2">
            <Button onClick={generateAIPromos} disabled={generating} variant="outline" className="rounded-xl">
              <Sparkles className="w-4 h-4 me-2" />
              {generating ? (isAr ? "جاري التوليد..." : "Generating...") : (isAr ? "توليد عروض ذكية" : "AI Generate")}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 me-2" />{t("add")}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{isAr ? "إنشاء عرض" : "Create Promotion"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>{t("name")}</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>{isAr ? "النوع" : "Type"}</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bundle">{t("bundles")}</SelectItem>
                        <SelectItem value="combo">{t("combos")}</SelectItem>
                        <SelectItem value="seasonal">{t("seasonal")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t("price")} ({currency})</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} dir="ltr" /></div>
                  <Button onClick={handleCreate} className="w-full rounded-xl">{t("save")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Promo Cards */}
        {promos.length === 0 ? (
          <Card className="rounded-2xl"><CardContent className="py-12 text-center">
            <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{isAr ? "لا توجد عروض — اضغط 'توليد عروض ذكية'" : "No promotions — click 'AI Generate'"}</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promos.map(p => (
              <Card key={p.id} className="shadow-card rounded-2xl hover:shadow-card-hover transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className={`${typeColors[p.type] || "bg-muted"} border-0 mb-2`}>{p.type}</Badge>
                      <h3 className="font-semibold">{p.title}</h3>
                    </div>
                    <p className="text-xl font-extrabold text-primary">{p.suggested_price.toLocaleString()} {currency}</p>
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground mb-3">{p.description}</p>}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {p.expected_margin > 0 && <span className="flex items-center gap-1"><Percent className="w-3 h-3" />{isAr ? `هامش ${p.expected_margin}%` : `${p.expected_margin}% margin`}</span>}
                    {p.timing && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.timing}</span>}
                  </div>
                  {p.reason && <p className="text-xs text-muted-foreground mt-2 bg-muted/30 rounded-lg p-2">{p.reason}</p>}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="rounded-lg flex-1">
                      <Share2 className="w-3.5 h-3.5 me-1" />WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
