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
  Plus, FileSpreadsheet, UtensilsCrossed, AlertTriangle,
  TrendingUp, Gauge, Calculator, Swords, Sparkles, Crown
} from "lucide-react";
import { mockRecommendations, mockCompetitors } from "@/lib/mock-data";

interface RecipeRisk {
  name: string;
  margin: number;
}

interface SpikeAlert {
  name: string;
  change: number;
}

export default function Dashboard() {
  const { restaurant, plan } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(true);
  const [riskPct, setRiskPct] = useState(0);
  const [riskyRecipes, setRiskyRecipes] = useState<RecipeRisk[]>([]);
  const [spikes, setSpikes] = useState<SpikeAlert[]>([]);
  const [overheadPerPlate, setOverheadPerPlate] = useState(0);
  const [totalOverhead, setTotalOverhead] = useState(0);
  const [totalDishes, setTotalDishes] = useState(0);

  useEffect(() => {
    if (restaurant) loadDashboard();
  }, [restaurant]);

  const loadDashboard = async () => {
    if (!restaurant) return;
    setLoading(true);

    const [recipesRes, costsRes] = await Promise.all([
      supabase
        .from("recipes")
        .select("id, name, selling_price, recipe_ingredients(quantity, ingredients(unit_price))")
        .eq("restaurant_id", restaurant.id),
      supabase
        .from("operating_costs")
        .select("name, monthly_amount")
        .eq("restaurant_id", restaurant.id),
    ]);

    const recipes = recipesRes.data ?? [];
    const costs = costsRes.data ?? [];
    const totalOp = costs.reduce((s, c) => s + Number(c.monthly_amount), 0);
    const numDishes = recipes.length || 1;
    const overhead = totalOp / numDishes;

    setTotalOverhead(totalOp);
    setOverheadPerPlate(Math.round(overhead));
    setTotalDishes(recipes.length);

    // Calculate risk gauge
    const targetMargin = restaurant.target_margin_pct;
    const risky: RecipeRisk[] = [];
    recipes.forEach(r => {
      const ingCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const trueCost = ingCost + overhead;
      const sp = Number(r.selling_price);
      const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : -100;
      if (margin < targetMargin) {
        risky.push({ name: r.name, margin: Math.round(margin) });
      }
    });
    const riskPercent = recipes.length > 0 ? Math.round((risky.length / recipes.length) * 100) : 0;
    setRiskPct(riskPercent);
    setRiskyRecipes(risky.sort((a, b) => a.margin - b.margin).slice(0, 5));

    // Ingredient spike alerts (mock - would need price history table for real)
    // Using mock data for now as we don't have price_history table
    setSpikes([
      { name: "طماطم", change: 25 },
      { name: "زيت زيتون", change: 18 },
      { name: "صدر دجاج", change: 12 },
    ].filter(s => s.change > 15));

    setLoading(false);
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";
  const riskColor = riskPct < 10 ? "text-success" : riskPct < 30 ? "text-warning" : "text-destructive";
  const riskBg = riskPct < 10 ? "bg-success/10" : riskPct < 30 ? "bg-warning/10" : "bg-destructive/10";

  // Competition summary (mock for Pro/Elite)
  const trackedCompetitors = mockCompetitors.length;
  const mispricingCount = 2; // mock

  // AI recommendations (Elite)
  const newRecs = mockRecommendations.filter(r => r.status === "new");

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>

        {/* Row 1: Risk Gauge + Spikes + Overhead */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Gauge */}
          <Card className="shadow-card cursor-pointer hover:shadow-card-hover transition-shadow">
            <Link to="/app/recipes">
              <CardContent className="pt-6 text-center">
                <div className={`w-20 h-20 rounded-full ${riskBg} flex items-center justify-center mx-auto mb-3`}>
                  <span className={`text-3xl font-extrabold ${riskColor}`}>{riskPct}%</span>
                </div>
                <p className="font-medium flex items-center justify-center gap-2">
                  <Gauge className="w-4 h-4" />
                  {t("riskGauge")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr ? `${riskyRecipes.length} وصفة تحت الهدف` : `${riskyRecipes.length} recipes below target`}
                </p>
              </CardContent>
            </Link>
          </Card>

          {/* Ingredient Spike Alerts */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <p className="font-medium flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warning" />
                {t("ingredientAlerts")}
              </p>
              {spikes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{isAr ? "لا توجد تنبيهات" : "No alerts"}</p>
              ) : (
                <div className="space-y-2">
                  {spikes.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-warning/5 rounded-lg px-3 py-2">
                      <span>{s.name}</span>
                      <Badge variant="outline" className="text-destructive border-destructive/30">
                        <TrendingUp className="w-3 h-3 me-1" />+{s.change}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overhead per Plate */}
          <Card className="shadow-card">
            <Link to="/app/overhead">
              <CardContent className="pt-6 text-center">
                <Calculator className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-extrabold">{overheadPerPlate.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{currency} / {isAr ? "طبق" : "plate"}</p>
                <p className="font-medium mt-2">{t("overheadPerPlate")}</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Row 2: Competition Summary (Pro+) + AI Feed (Elite) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Competition Summary */}
          {(plan === "pro" || plan === "elite") ? (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Swords className="w-4 h-4 text-primary" />
                  {t("competitionSummary")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div>
                    <p className="text-2xl font-extrabold">{trackedCompetitors}</p>
                    <p className="text-xs text-muted-foreground">{isAr ? "منافس متتبع" : "tracked"}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-warning">{mispricingCount}</p>
                    <p className="text-xs text-muted-foreground">{isAr ? "تسعير خاطئ" : "mispriced"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/app/competition/report">{isAr ? "عرض التقرير" : "View Report"}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card opacity-60">
              <CardContent className="pt-6 text-center">
                <Swords className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium">{t("competitionSummary")}</p>
                <Badge variant="outline" className="mt-2"><Crown className="w-3 h-3 me-1" />{t("pro")}</Badge>
                <p className="text-xs text-muted-foreground mt-2">{t("lockedFeature")}</p>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations Feed */}
          {plan === "elite" ? (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t("aiFeed")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {newRecs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noData")}</p>
                ) : (
                  <div className="space-y-2">
                    {newRecs.slice(0, 3).map(rec => (
                      <div key={rec.id} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.impact}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                  <Link to="/app/recommendations">{isAr ? "عرض الكل" : "View All"}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card opacity-60">
              <CardContent className="pt-6 text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium">{t("aiFeed")}</p>
                <Badge variant="outline" className="mt-2"><Crown className="w-3 h-3 me-1" />{t("elite")}</Badge>
                <p className="text-xs text-muted-foreground mt-2">{t("lockedFeature")}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link to="/app/ingredients"><Plus className="w-4 h-4 me-2" />{t("addIngredient")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/app/ingredients/import"><FileSpreadsheet className="w-4 h-4 me-2" />{t("importIngredients")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/app/recipes/new"><UtensilsCrossed className="w-4 h-4 me-2" />{t("createRecipe")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/app/competition/competitors"><Swords className="w-4 h-4 me-2" />{t("addCompetitor")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Risky Recipes List */}
        {riskyRecipes.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                {isAr ? "الوصفات تحت الهدف" : "Below-Target Recipes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {riskyRecipes.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-destructive/5 rounded-lg px-4 py-2.5">
                    <span className="text-sm font-medium">{r.name}</span>
                    <Badge variant="outline" className={r.margin < 0 ? "text-destructive border-destructive/30" : "text-warning border-warning/30"}>
                      {r.margin}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
