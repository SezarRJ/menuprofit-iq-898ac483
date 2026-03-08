import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/true-cost";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Sparkles, Shield, Target, Crown, TrendingUp } from "lucide-react";

interface Recipe {
  id: string; name: string; category: string; selling_price: number;
  food_cost: number; true_cost: number;
}

interface PriceSuggestion {
  min_safe: number; recommended: number; attractive: number; premium: number;
  explanations: Record<string, string>;
  confidence: Record<string, string>;
}

export default function PricingEngine() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);

  const ccy = restaurant?.default_currency || "IQD";
  const fc = (n: number) => formatCurrency(Math.round(n), ccy);

  useEffect(() => { if (restaurant) load(); else setLoading(false); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const [recipesRes, costsRes, profilesRes] = await Promise.all([
      supabase.from("recipes")
        .select("id, name, category, selling_price, kitchen_profile, packaging_channel, recipe_ingredients(quantity, ingredients(unit_price))")
        .eq("restaurant_id", restaurant!.id),
      supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant!.id),
      supabase.from("kitchen_profiles").select("*").eq("restaurant_id", restaurant!.id),
    ]);

    const totalOp = (costsRes.data ?? []).reduce((s, c) => s + Number(c.monthly_amount), 0);
    const baseline = (restaurant as any)?.baseline_plates || 6000;
    const overheadPP = baseline > 0 ? totalOp / baseline : 0;
    const washingPP = (restaurant as any)?.washing_per_plate ?? 200;
    const wasteBudget = (restaurant as any)?.monthly_waste_budget ?? 0;
    const wasteAlloc = baseline > 0 ? wasteBudget / baseline : 0;

    const kProfiles: Record<string, number> = {};
    (profilesRes.data ?? []).forEach((p: any) => {
      kProfiles[p.profile_type] = Number(p.energy_cost) + Number(p.labor_cost) + Number(p.equipment_cost);
    });
    const defaultKL: Record<string, number> = { light: 600, medium: 1350, heavy: 2500 };

    const packCosts: Record<string, number> = {
      "dine-in": (restaurant as any)?.packaging_dinein ?? 0,
      "takeaway": (restaurant as any)?.packaging_takeaway ?? 500,
      "delivery": (restaurant as any)?.packaging_delivery ?? 1000,
    };

    const mapped = (recipesRes.data ?? []).map(r => {
      const foodCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const kProfile = (r as any).kitchen_profile || "medium";
      const pChannel = (r as any).packaging_channel || "dine-in";
      const kitchenLoad = kProfiles[kProfile] ?? defaultKL[kProfile] ?? 1350;
      const packaging = packCosts[pChannel] ?? 0;
      const trueCost = foodCost + kitchenLoad + packaging + washingPP + wasteAlloc + overheadPP;
      return { id: r.id, name: r.name, category: r.category, selling_price: Number(r.selling_price), food_cost: foodCost, true_cost: trueCost };
    });
    setRecipes(mapped);
    if (mapped.length > 0) setSelected(mapped[0].id);
    setLoading(false);
  };

  const generatePricing = async () => {
    const recipe = recipes.find(r => r.id === selected);
    if (!recipe) return;
    setGenerating(true);

    // Also check competitor prices
    const { data: compPrices } = await supabase.from("competitor_prices").select("price").eq("recipe_id", recipe.id);
    const avgComp = compPrices && compPrices.length > 0 ? compPrices.reduce((s, c) => s + Number(c.price), 0) / compPrices.length : 0;

    const trueCost = recipe.true_cost;
    const minSafe = Math.round(trueCost * 1.1);
    const recommended = avgComp > 0 ? Math.round((trueCost * 1.45 + avgComp) / 2) : Math.round(trueCost * 1.45);
    const attractive = Math.round(recommended * 0.95); // psychological
    const premium = avgComp > 0 ? Math.round(avgComp * 1.15) : Math.round(trueCost * 1.7);

    setSuggestion({
      min_safe: minSafe,
      recommended,
      attractive,
      premium,
      explanations: {
        min_safe: isAr ? `يغطي التكلفة الحقيقية (${fc(trueCost)}) + هامش أمان 10%` : `Covers true cost (${fc(trueCost)}) + 10% safety margin`,
        recommended: avgComp > 0
          ? (isAr ? `موازنة بين التكلفة ومتوسط المنافسين (${fc(avgComp)})` : `Balanced between cost and competitor avg (${fc(avgComp)})`)
          : (isAr ? "سعر تنافسي يحقق هامش ربح جيد" : "Competitive price with good margin"),
        attractive: isAr ? "تسعير نفسي جذاب — رقم مألوف يجذب العملاء" : "Psychological pricing — familiar number that attracts customers",
        premium: avgComp > 0
          ? (isAr ? `أعلى من متوسط المنافسين بـ 15% — تموضع راقي` : `15% above competitor avg — premium positioning`)
          : (isAr ? "تموضع راقي للعلامة التجارية" : "Premium brand positioning"),
      },
      confidence: {
        min_safe: isAr ? "عالية" : "High",
        recommended: avgComp > 0 ? (isAr ? "عالية" : "High") : (isAr ? "متوسطة" : "Medium"),
        attractive: isAr ? "متوسطة" : "Medium",
        premium: isAr ? "متوسطة" : "Medium",
      },
    });
    setGenerating(false);
  };

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></AppLayout>;

  const selectedRecipe = recipes.find(r => r.id === selected);

  const priceCards = suggestion ? [
    { label: t("minSafePrice"), value: suggestion.min_safe, explanation: suggestion.explanations.min_safe, confidence: suggestion.confidence.min_safe, icon: Shield, color: "text-warning", bg: "bg-warning/10" },
    { label: t("recommendedPrice"), value: suggestion.recommended, explanation: suggestion.explanations.recommended, confidence: suggestion.confidence.recommended, icon: Target, color: "text-success", bg: "bg-success/10" },
    { label: t("attractivePrice"), value: suggestion.attractive, explanation: suggestion.explanations.attractive, confidence: suggestion.confidence.attractive, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: t("premiumPrice"), value: suggestion.premium, explanation: suggestion.explanations.premium, confidence: suggestion.confidence.premium, icon: Crown, color: "text-primary", bg: "bg-primary/10" },
  ] : [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">{t("pricingEngine")}</h1>

        <Card className="shadow-card rounded-2xl">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">{isAr ? "اختر الطبق" : "Select Recipe"}</label>
                <Select value={selected} onValueChange={v => { setSelected(v); setSuggestion(null); }}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {recipes.map(r => <SelectItem key={r.id} value={r.id}>{r.name} — {r.category}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generatePricing} disabled={generating || !selected} className="rounded-xl gradient-primary border-0">
                <Sparkles className="w-4 h-4 me-2" />
                {generating ? (isAr ? "جاري التحليل..." : "Analyzing...") : t("generatePricing")}
              </Button>
            </div>

            {selectedRecipe && (
              <div className="flex gap-4 md:gap-6 text-sm bg-muted/30 rounded-xl p-4 flex-wrap">
                <div><span className="text-muted-foreground">{t("foodCost")}:</span> <span className="font-semibold">{fc(selectedRecipe.food_cost)}</span></div>
                <div><span className="text-muted-foreground">{t("trueCost")}:</span> <span className="font-semibold">{fc(selectedRecipe.true_cost)}</span></div>
                <div><span className="text-muted-foreground">{t("sellingPrice")}:</span> <span className="font-semibold">{fc(selectedRecipe.selling_price)}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {suggestion && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priceCards.map((card, i) => (
              <Card key={i} className="shadow-card rounded-2xl hover:shadow-card-hover transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5">{card.confidence}</Badge>
                      </div>
                      <p className={`text-2xl font-extrabold ${card.color} mt-1`}>{fc(card.value)}</p>
                      <p className="text-xs text-muted-foreground mt-2">{card.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {recipes.length === 0 && (
          <Card className="rounded-2xl"><CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{isAr ? "أضف وصفات أولاً لتوليد الأسعار" : "Add recipes first to generate pricing"}</p>
          </CardContent></Card>
        )}
      </div>
    </AppLayout>
  );
}
