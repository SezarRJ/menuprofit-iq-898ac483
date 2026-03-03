import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UtensilsCrossed, AlertTriangle, TrendingUp, Sparkles,
  DollarSign, Trash2, Gift, FileSpreadsheet, Check,
  BarChart3, MessageCircle
} from "lucide-react";

export default function Dashboard() {
  const { restaurant, plan } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(true);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [priceChanges, setPriceChanges] = useState(0);
  const [highCost, setHighCost] = useState(0);
  const [improvements, setImprovements] = useState(0);
  const [removeCount, setRemoveCount] = useState(0);
  const [promoCount, setPromoCount] = useState(0);
  const [topAction, setTopAction] = useState("");

  useEffect(() => {
    if (restaurant) loadDashboard();
  }, [restaurant]);

  const loadDashboard = async () => {
    if (!restaurant) return;
    setLoading(true);

    const [recipesRes, costsRes] = await Promise.all([
      supabase
        .from("recipes")
        .select("id, name, selling_price, category, recipe_ingredients(quantity, ingredients(unit_price))")
        .eq("restaurant_id", restaurant.id),
      supabase
        .from("operating_costs")
        .select("monthly_amount")
        .eq("restaurant_id", restaurant.id),
    ]);

    const recipes = recipesRes.data ?? [];
    const costs = costsRes.data ?? [];
    const totalOp = costs.reduce((s, c) => s + Number(c.monthly_amount), 0);
    const numRecipes = recipes.length || 1;
    const overhead = totalOp / numRecipes;
    const targetMargin = restaurant.target_margin_pct;

    setTotalRecipes(recipes.length);

    let priceChangeCount = 0;
    let highCostCount = 0;
    let removeableCount = 0;
    const actions: string[] = [];

    recipes.forEach(r => {
      const ingCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const trueCost = ingCost + overhead;
      const sp = Number(r.selling_price);
      const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : -100;

      if (margin < targetMargin && margin >= 0) {
        priceChangeCount++;
        actions.push(isAr ? `عدّل سعر ${r.name}` : `Adjust ${r.name} price`);
      }
      if (margin < 10 && margin >= 0) highCostCount++;
      if (margin < 0) {
        removeableCount++;
        actions.push(isAr ? `راجع ${r.name} — خسارة` : `Review ${r.name} — loss maker`);
      }
    });

    setPriceChanges(priceChangeCount);
    setHighCost(highCostCount);
    setRemoveCount(removeableCount);
    setImprovements(Math.max(priceChangeCount + highCostCount, 0));
    setPromoCount(Math.min(recipes.filter(r => {
      const ingCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const margin = Number(r.selling_price) > 0 ? ((Number(r.selling_price) - ingCost - overhead) / Number(r.selling_price)) * 100 : 0;
      return margin > 50;
    }).length, 10));

    setTopAction(actions.slice(0, 2).join(" + ") || (isAr ? "لا توجد إجراءات عاجلة" : "No urgent actions"));
    setLoading(false);
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  const cards = [
    { label: t("totalRecipes"), value: totalRecipes, icon: UtensilsCrossed, color: "text-success", bg: "bg-success/10", emoji: "✓" },
    { label: t("priceChangesNeeded"), value: priceChanges, icon: DollarSign, color: "text-warning", bg: "bg-warning/10", emoji: "⚠️" },
    { label: t("highCostRecipes"), value: highCost, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", emoji: "🚨" },
    { label: t("suggestedImprovements"), value: improvements, icon: Sparkles, color: "text-primary", bg: "bg-primary/10", emoji: "✨" },
    { label: t("removeRecipes"), value: removeCount, icon: Trash2, color: "text-destructive", bg: "bg-destructive/10", emoji: "❌" },
    { label: t("promoOpportunities"), value: promoCount, icon: Gift, color: "text-success", bg: "bg-success/10", emoji: "🎁" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <Card key={i} className="shadow-card rounded-2xl hover:shadow-card-hover transition-shadow">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
                    <p className={`text-3xl font-extrabold ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Actions Today */}
        <Card className="shadow-card rounded-2xl border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("topActionsToday")}</p>
                <p className="font-semibold text-base mt-0.5">"{topAction}"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Sales Button */}
        <Button size="lg" className="w-full rounded-2xl h-14 text-base gradient-primary border-0" asChild>
          <Link to="/app/data-hub/sales">
            <FileSpreadsheet className="w-5 h-5 me-2" />
            {isAr ? "استيراد مبيعات اليوم" : "Import Today's Sales"}
          </Link>
        </Button>

        {/* Performance Trends Placeholder */}
        <Card className="shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {isAr ? "اتجاهات الأداء" : "Performance Trends"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm bg-muted/30 rounded-xl">
              {isAr ? "الرسوم البيانية ستظهر هنا بعد استيراد المبيعات" : "Charts will appear after importing sales data"}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" className="rounded-xl">
                <Link to="/app/data-hub/ingredients"><Check className="w-4 h-4 me-2" />{t("addIngredient")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link to="/app/data-hub/ingredients/import"><FileSpreadsheet className="w-4 h-4 me-2" />{t("importIngredients")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link to="/app/menu-studio/recipes/new"><UtensilsCrossed className="w-4 h-4 me-2" />{t("createRecipe")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link to="/app/pricing-engine"><DollarSign className="w-4 h-4 me-2" />{t("pricingEngine")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
