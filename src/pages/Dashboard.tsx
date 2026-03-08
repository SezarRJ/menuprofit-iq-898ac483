import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/true-cost";
import {
  UtensilsCrossed, AlertTriangle, TrendingDown, Sparkles,
  DollarSign, Calculator, Swords, Brain,
  FileSpreadsheet, ArrowLeft, Package, Gift
} from "lucide-react";

export default function Dashboard() {
  const { restaurant, user, loading: ctxLoading } = useRestaurant();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecipes: 0, belowTarget: 0, overheadPerPlate: 0,
    ingredientAlerts: 0, competitionGaps: 0, aiRecommendations: 0,
  });
  const [topActions, setTopActions] = useState<string[]>([]);

  useEffect(() => {
    if (ctxLoading) return;
    if (!user) { setLoading(false); return; }
    if (!restaurant) { navigate("/onboarding"); return; }
    loadDashboard();
  }, [restaurant, user, ctxLoading]);

  const loadDashboard = async () => {
    if (!restaurant) return;
    setLoading(true);

    const [recipesRes, costsRes, recsRes, compRes, profilesRes] = await Promise.all([
      supabase.from("recipes")
        .select("id, name, selling_price, kitchen_profile, packaging_channel, recipe_ingredients(quantity, ingredients(unit_price))")
        .eq("restaurant_id", restaurant.id),
      supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant.id),
      supabase.from("ai_recommendations").select("id").eq("restaurant_id", restaurant.id).eq("status", "new"),
      supabase.from("competitor_prices").select("id, recipe_id, price, recipes!inner(selling_price, restaurant_id)")
        .eq("recipes.restaurant_id", restaurant.id),
      supabase.from("kitchen_profiles").select("*").eq("restaurant_id", restaurant.id),
    ]);

    const recipes = recipesRes.data ?? [];
    const costs = costsRes.data ?? [];
    const totalOp = costs.reduce((s, c) => s + Number(c.monthly_amount), 0);
    const baseline = (restaurant as any).baseline_plates || 6000;
    const overheadPerPlate = baseline > 0 ? totalOp / baseline : 0;
    const targetMargin = restaurant.target_margin_pct;
    const washingPP = (restaurant as any).washing_per_plate ?? 200;
    const wasteBudget = (restaurant as any).monthly_waste_budget ?? 0;
    const wasteAlloc = baseline > 0 ? wasteBudget / baseline : 0;

    // Build kitchen profiles map
    const kProfiles: Record<string, number> = {};
    (profilesRes.data ?? []).forEach((p: any) => {
      kProfiles[p.profile_type] = Number(p.energy_cost) + Number(p.labor_cost) + Number(p.equipment_cost);
    });
    const defaultKL: Record<string, number> = { light: 600, medium: 1350, heavy: 2500 };

    const packCosts: Record<string, number> = {
      "dine-in": (restaurant as any).packaging_dinein ?? 0,
      "takeaway": (restaurant as any).packaging_takeaway ?? 500,
      "delivery": (restaurant as any).packaging_delivery ?? 1000,
    };

    let belowCount = 0;
    const actions: string[] = [];

    recipes.forEach(r => {
      const ingCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const kProfile = (r as any).kitchen_profile || "medium";
      const pChannel = (r as any).packaging_channel || "dine-in";
      const kitchenLoad = kProfiles[kProfile] ?? defaultKL[kProfile] ?? 1350;
      const packaging = packCosts[pChannel] ?? 0;
      const trueCost = ingCost + kitchenLoad + packaging + washingPP + wasteAlloc + overheadPerPlate;
      const sp = Number(r.selling_price);
      const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : -100;

      if (margin < targetMargin) {
        belowCount++;
        if (actions.length < 3) {
          actions.push(isAr ? `راجع سعر ${r.name} (هامش ${margin.toFixed(0)}%)` : `Review ${r.name} price (${margin.toFixed(0)}% margin)`);
        }
      }
    });

    let gapCount = 0;
    (compRes.data ?? []).forEach((cp: any) => {
      const sp = Number(cp.recipes?.selling_price ?? 0);
      const compPrice = Number(cp.price);
      if (sp > 0 && Math.abs(sp - compPrice) / sp > 0.15) gapCount++;
    });

    setStats({
      totalRecipes: recipes.length,
      belowTarget: belowCount,
      overheadPerPlate: Math.round(overheadPerPlate),
      ingredientAlerts: 0,
      competitionGaps: gapCount,
      aiRecommendations: recsRes.data?.length ?? 0,
    });
    setTopActions(actions.length > 0 ? actions : [isAr ? "لا توجد إجراءات عاجلة — أحسنت! 👍" : "No urgent actions — great job! 👍"]);
    setLoading(false);
  };

  const ccy = restaurant?.default_currency || "IQD";
  const fc = (n: number) => formatCurrency(n, ccy);

  if (loading || ctxLoading) {
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

  if (!restaurant) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Sparkles className="w-16 h-16 text-primary/30" />
          <p className="text-lg text-muted-foreground">{isAr ? "لم يتم إعداد مطعمك بعد" : "No restaurant set up yet"}</p>
          <Button onClick={() => navigate("/onboarding")} className="gradient-primary border-0 rounded-xl">
            {isAr ? "ابدأ الإعداد" : "Start Setup"}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const cards = [
    { label: t("totalRecipes"), value: stats.totalRecipes, icon: UtensilsCrossed, color: "text-success", bg: "bg-success/10", link: "/app/menu-studio/recipes" },
    { label: t("recipesBelow"), value: stats.belowTarget, icon: TrendingDown, color: stats.belowTarget > 0 ? "text-destructive" : "text-success", bg: stats.belowTarget > 0 ? "bg-destructive/10" : "bg-success/10", link: "/app/menu-studio/recipes" },
    { label: t("overheadPerPlate"), value: fc(stats.overheadPerPlate), icon: Calculator, color: "text-primary", bg: "bg-primary/10", link: "/app/data-hub/overhead" },
    { label: t("competitionGaps"), value: stats.competitionGaps, icon: Swords, color: stats.competitionGaps > 0 ? "text-warning" : "text-success", bg: stats.competitionGaps > 0 ? "bg-warning/10" : "bg-success/10", link: "/app/competition" },
    { label: t("aiRecommendations"), value: stats.aiRecommendations, icon: Brain, color: "text-primary", bg: "bg-primary/10", link: "/app/ai-recommendations" },
    { label: t("promoOpportunities"), value: stats.belowTarget > 0 ? Math.max(stats.totalRecipes - stats.belowTarget, 0) : stats.totalRecipes, icon: Gift, color: "text-success", bg: "bg-success/10", link: "/app/promotion-studio" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isAr ? "مركز القرارات التشغيلية" : "Operational Decision Center"}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <Link key={i} to={card.link}>
              <Card className="shadow-card rounded-2xl hover:shadow-card-hover transition-shadow cursor-pointer group">
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
                      <p className={`text-2xl md:text-3xl font-extrabold ${card.color}`}>{card.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-2 flex items-center gap-1 group-hover:text-primary transition-colors">
                    <ArrowLeft className="w-3 h-3" />{isAr ? "اضغط للتفاصيل" : "View details"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Top Actions Today */}
        <Card className="shadow-card rounded-2xl border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("topActionsToday")}</p>
                <div className="space-y-1">
                  {topActions.map((a, i) => (
                    <p key={i} className="text-sm font-medium">• {a}</p>
                  ))}
                </div>
              </div>
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
                <Link to="/app/data-hub/ingredients?add=1"><Package className="w-4 h-4 me-2" />{t("addIngredient")}</Link>
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
