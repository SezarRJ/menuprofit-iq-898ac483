import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, PieChart, Package, TrendingUp, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/true-cost";

export default function RiskRadar() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(true);
  const [marginRisk, setMarginRisk] = useState(0);
  const [ingredientRisk, setIngredientRisk] = useState(0);
  const [concentrationRisk, setConcentrationRisk] = useState(0);
  const [topFactors, setTopFactors] = useState<string[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  useEffect(() => { if (restaurant) loadRisk(); else setLoading(false); }, [restaurant]);

  const loadRisk = async () => {
    if (!restaurant) return;
    setLoading(true);

    const [recipesRes, costsRes, salesRes] = await Promise.all([
      supabase.from("recipes").select("id, name, selling_price, recipe_ingredients(quantity, ingredients(unit_price, name))").eq("restaurant_id", restaurant.id),
      supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant.id),
      supabase.from("sales_imports").select("id").eq("restaurant_id", restaurant.id).limit(1),
    ]);

    const recipes = recipesRes.data ?? [];
    const totalOp = (costsRes.data ?? []).reduce((s, c) => s + Number(c.monthly_amount), 0);
    const baseline = (restaurant as any).baseline_plates || 6000;
    const overheadPP = baseline > 0 ? totalOp / baseline : 0;

    // Calculate margin risk
    let belowTarget = 0;
    let lossMakers = 0;
    const factors: string[] = [];
    const actions: string[] = [];

    recipes.forEach(r => {
      const foodCost = r.recipe_ingredients?.reduce((s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0) ?? 0;
      const trueCost = foodCost + overheadPP + 1350 + 200; // + kitchen load + washing defaults
      const sp = Number(r.selling_price);
      const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : -100;
      if (margin < (restaurant.target_margin_pct || 45)) belowTarget++;
      if (margin < 0) {
        lossMakers++;
        factors.push(isAr ? `${r.name} يعمل بخسارة (هامش ${margin.toFixed(0)}%)` : `${r.name} is a loss maker (${margin.toFixed(0)}% margin)`);
        actions.push(isAr ? `مراجعة سعر ${r.name} أو إزالته` : `Review ${r.name} price or remove it`);
      }
    });

    const mRisk = recipes.length > 0 ? Math.min(100, Math.round((belowTarget / recipes.length) * 100)) : 0;
    setMarginRisk(mRisk);

    // Ingredient risk: based on price history spikes
    const { data: priceHistory } = await supabase.from("ingredient_price_history").select("ingredient_id, price").eq("restaurant_id", restaurant.id).order("effective_date", { ascending: false }).limit(100);
    const iRisk = priceHistory && priceHistory.length > 5 ? 35 : 15;
    setIngredientRisk(iRisk);

    // Concentration: if few recipes dominate
    const cRisk = recipes.length < 5 ? 60 : recipes.length < 10 ? 30 : 10;
    setConcentrationRisk(cRisk);

    if (recipes.length < 5) {
      factors.push(isAr ? "عدد الوصفات قليل — مخاطر تركيز عالية" : "Too few recipes — high concentration risk");
      actions.push(isAr ? "أضف المزيد من الأطباق لتنويع القائمة" : "Add more dishes to diversify the menu");
    }

    if (factors.length === 0) factors.push(isAr ? "لا توجد مخاطر عالية حالياً" : "No high risks currently");
    if (actions.length === 0) actions.push(isAr ? "استمر بمراقبة الهوامش والأسعار" : "Continue monitoring margins and prices");

    setTopFactors(factors.slice(0, 5));
    setSuggestedActions(actions.slice(0, 5));
    setLoading(false);
  };

  const overallScore = Math.round((marginRisk * 0.5 + ingredientRisk * 0.3 + concentrationRisk * 0.2));
  const scoreColor = overallScore < 30 ? "text-success" : overallScore < 60 ? "text-warning" : "text-destructive";
  const scoreBg = overallScore < 30 ? "bg-success/10" : overallScore < 60 ? "bg-warning/10" : "bg-destructive/10";

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></AppLayout>;

  const riskComponents = [
    { label: isAr ? "مخاطر الهامش" : "Margin Risk", value: marginRisk, icon: PieChart },
    { label: isAr ? "مخاطر المكونات" : "Ingredient Risk", value: ingredientRisk, icon: Package },
    { label: isAr ? "مخاطر التركيز" : "Concentration Risk", value: concentrationRisk, icon: TrendingUp },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h1 className="text-2xl font-bold">{t("riskRadar")}</h1>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="md:col-span-1 rounded-2xl shadow-card">
            <CardContent className="pt-6 text-center">
              <div className={`w-24 h-24 rounded-full ${scoreBg} flex items-center justify-center mx-auto mb-3`}>
                <span className={`text-4xl font-extrabold ${scoreColor}`}>{overallScore}</span>
              </div>
              <p className="font-medium">{t("riskScore")}</p>
              <p className="text-xs text-muted-foreground">{isAr ? "من 100" : "out of 100"}</p>
            </CardContent>
          </Card>

          {riskComponents.map((rc, i) => (
            <Card key={i} className="rounded-2xl shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <rc.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{rc.label}</span>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${rc.value < 30 ? "bg-success" : rc.value < 60 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${rc.value}%` }} />
                </div>
                <p className={`text-2xl font-extrabold ${rc.value < 30 ? "text-success" : rc.value < 60 ? "text-warning" : "text-destructive"}`}>{rc.value}%</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="rounded-2xl shadow-card">
            <CardHeader><CardTitle className="text-sm">{isAr ? "أهم عوامل الخطر" : "Top Risk Factors"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topFactors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-destructive/5 rounded-lg px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-card">
            <CardHeader><CardTitle className="text-sm">{isAr ? "الإجراءات المقترحة" : "Suggested Actions"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {suggestedActions.map((a, i) => (
                <div key={i} className="flex items-center gap-2 bg-success/5 rounded-lg px-3 py-2.5">
                  <Shield className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm">{a}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
