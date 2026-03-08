import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, DollarSign, Swords, Package, Gift, FileText, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/true-cost";

interface RecipeReport {
  name: string; category: string; sellingPrice: number; foodCost: number; trueCost: number; margin: number;
}

export default function Reports() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<RecipeReport[]>([]);
  const [activeReport, setActiveReport] = useState("cost-margin");

  const ccy = restaurant?.default_currency || "IQD";

  useEffect(() => { if (restaurant) loadData(); else setLoading(false); }, [restaurant]);

  const loadData = async () => {
    setLoading(true);
    const [recipesRes, costsRes] = await Promise.all([
      supabase.from("recipes").select("name, category, selling_price, recipe_ingredients(quantity, ingredients(unit_price))").eq("restaurant_id", restaurant!.id),
      supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant!.id),
    ]);

    const totalOp = (costsRes.data ?? []).reduce((s, c) => s + Number(c.monthly_amount), 0);
    const baseline = (restaurant as any)?.baseline_plates || 6000;
    const overheadPP = baseline > 0 ? totalOp / baseline : 0;

    const mapped = (recipesRes.data ?? []).map(r => {
      const foodCost = r.recipe_ingredients?.reduce((s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0) ?? 0;
      const trueCost = foodCost + overheadPP + 1350 + 200;
      const sp = Number(r.selling_price);
      const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : -100;
      return { name: r.name, category: r.category, sellingPrice: sp, foodCost, trueCost, margin };
    });

    setRecipes(mapped.sort((a, b) => a.margin - b.margin));
    setLoading(false);
  };

  const fc = (n: number) => formatCurrency(Math.round(n), ccy);

  const reportTabs = [
    { id: "cost-margin", label: t("costMarginReport"), icon: DollarSign },
    { id: "pricing-opp", label: t("pricingReport"), icon: TrendingUp },
    { id: "promo-opp", label: t("promotionReport"), icon: Gift },
  ];

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></AppLayout>;

  const weak = recipes.filter(r => r.margin < 20);
  const strong = recipes.filter(r => r.margin >= 40);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">{t("reports")}</h1>

        {/* Tab Buttons */}
        <div className="flex gap-2 flex-wrap">
          {reportTabs.map(tab => (
            <Button key={tab.id} variant={activeReport === tab.id ? "default" : "outline"} size="sm" className="rounded-xl"
              onClick={() => setActiveReport(tab.id)}>
              <tab.icon className="w-4 h-4 me-1.5" />{tab.label}
            </Button>
          ))}
        </div>

        {recipes.length === 0 ? (
          <Card className="rounded-2xl"><CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{isAr ? "أضف وصفات لتوليد التقارير" : "Add recipes to generate reports"}</p>
          </CardContent></Card>
        ) : (
          <>
            {activeReport === "cost-margin" && (
              <Card className="rounded-2xl shadow-card">
                <CardHeader><CardTitle className="text-base">{t("costMarginReport")}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recipes.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.category}</p>
                        </div>
                        <div className="text-end text-sm">
                          <p className="text-muted-foreground">{isAr ? "تكلفة حقيقية" : "True Cost"}: {fc(r.trueCost)}</p>
                          <p>{isAr ? "سعر بيع" : "Price"}: {fc(r.sellingPrice)}</p>
                        </div>
                        <Badge className={`${r.margin >= 40 ? "bg-success/10 text-success" : r.margin >= 20 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"} border-0 min-w-[60px] justify-center`}>
                          {r.margin.toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeReport === "pricing-opp" && (
              <Card className="rounded-2xl shadow-card">
                <CardHeader><CardTitle className="text-base">{t("pricingReport")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {weak.length > 0 ? weak.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-destructive/5 rounded-xl px-4 py-3">
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isAr ? `الهامش الحالي ${r.margin.toFixed(0)}% — السعر الموصى: ${fc(Math.round(r.trueCost * 1.45))}` 
                            : `Current margin ${r.margin.toFixed(0)}% — Recommended price: ${fc(Math.round(r.trueCost * 1.45))}`}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-6">{isAr ? "لا توجد فرص تسعير حالياً — جميع الأطباق بهوامش جيدة" : "No pricing opportunities — all dishes have good margins"}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeReport === "promo-opp" && (
              <Card className="rounded-2xl shadow-card">
                <CardHeader><CardTitle className="text-base">{t("promotionReport")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {strong.length > 0 ? strong.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-success/5 rounded-xl px-4 py-3">
                      <Gift className="w-4 h-4 text-success flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isAr ? `هامش ${r.margin.toFixed(0)}% — يمكن تقديم خصم آمن حتى ${Math.round(r.margin - 25)}%` 
                            : `${r.margin.toFixed(0)}% margin — safe discount up to ${Math.round(r.margin - 25)}%`}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-6">{isAr ? "لا توجد فرص عروض — حسّن هوامش الأطباق أولاً" : "No promo opportunities — improve margins first"}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
