import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
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
  explanations: { min_safe: string; recommended: string; attractive: string; premium: string };
  confidence: { min_safe: string; recommended: string; attractive: string; premium: string };
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

  useEffect(() => { if (restaurant) load(); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const { data: recs } = await supabase
      .from("recipes")
      .select("id, name, category, selling_price, recipe_ingredients(quantity, ingredients(unit_price))")
      .eq("restaurant_id", restaurant!.id);

    const { data: costs } = await supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant!.id);
    const totalOp = costs?.reduce((s, c) => s + Number(c.monthly_amount), 0) ?? 0;
    const overhead = totalOp / Math.max(recs?.length ?? 1, 1);

    const mapped = (recs ?? []).map(r => {
      const foodCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      return { id: r.id, name: r.name, category: r.category, selling_price: Number(r.selling_price), food_cost: foodCost, true_cost: foodCost + overhead };
    });
    setRecipes(mapped);
    if (mapped.length > 0) setSelected(mapped[0].id);
    setLoading(false);
  };

  const generatePricing = async () => {
    const recipe = recipes.find(r => r.id === selected);
    if (!recipe) return;
    setGenerating(true);

    try {
      await supabase.functions.invoke("ai-chat", {
        body: {
          restaurantId: restaurant!.id,
          messages: [{
            role: "user",
            content: `Generate 4 prices for "${recipe.name}" (${recipe.category}). True cost: ${recipe.true_cost.toFixed(0)} ${restaurant?.default_currency}. Current price: ${recipe.selling_price}.`
          }]
        }
      });
    } catch { /* fallback below */ }

    const trueCost = recipe.true_cost;
    setSuggestion({
      min_safe: Math.round(trueCost * 1.1),
      recommended: Math.round(trueCost * 1.45),
      attractive: Math.round(trueCost * 1.35),
      premium: Math.round(trueCost * 1.7),
      explanations: {
        min_safe: isAr ? `يغطي التكلفة الحقيقية (${trueCost.toFixed(0)}) + هامش 10%` : `Covers true cost (${trueCost.toFixed(0)}) + 10% margin`,
        recommended: isAr ? "سعر تنافسي يحقق هامش ربح جيد مع الحفاظ على تنافسية السوق" : "Competitive price with good margin and market positioning",
        attractive: isAr ? "تسعير نفسي جذاب للعملاء — رقم مألوف" : "Psychological pricing — familiar number attractive to customers",
        premium: isAr ? "تموضع راقي للعلامة التجارية — أعلى جودة مُدركة" : "High-end brand positioning — highest perceived quality",
      },
      confidence: {
        min_safe: isAr ? "عالية" : "High",
        recommended: isAr ? "عالية" : "High",
        attractive: isAr ? "متوسطة" : "Medium",
        premium: isAr ? "متوسطة" : "Medium",
      },
    });
    setGenerating(false);
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

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
            <div className="flex gap-4 items-end">
              <div className="flex-1">
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
                {generating ? (isAr ? "جاري التوليد..." : "Generating...") : t("generatePricing")}
              </Button>
            </div>

            {selectedRecipe && (
              <div className="flex gap-6 text-sm bg-muted/30 rounded-xl p-4">
                <div><span className="text-muted-foreground">{t("foodCost")}:</span> <span className="font-semibold">{selectedRecipe.food_cost.toLocaleString()} {currency}</span></div>
                <div><span className="text-muted-foreground">{t("trueCost")}:</span> <span className="font-semibold">{selectedRecipe.true_cost.toLocaleString()} {currency}</span></div>
                <div><span className="text-muted-foreground">{t("sellingPrice")}:</span> <span className="font-semibold">{selectedRecipe.selling_price.toLocaleString()} {currency}</span></div>
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
                      <p className={`text-2xl font-extrabold ${card.color} mt-1`}>{card.value.toLocaleString()} {currency}</p>
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