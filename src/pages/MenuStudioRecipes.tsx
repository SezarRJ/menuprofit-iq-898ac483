import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/true-cost";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UtensilsCrossed, Search, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

const categories = ["الكل", "شاورما", "برغر", "بيتزا", "مشويات", "سلطات", "مشروبات", "حلويات", "أطباق رئيسية", "مقبلات", "عام"];

type Strength = "strong" | "moderate" | "weak";

interface RecipeCard {
  id: string; name: string; category: string; selling_price: number;
  food_cost: number; true_cost: number; margin: number; strength: Strength;
  contribution: number;
}

export default function MenuStudioRecipes() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [recipes, setRecipes] = useState<RecipeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("الكل");
  const [filterStrength, setFilterStrength] = useState("all");

  const ccy = restaurant?.default_currency || "IQD";
  const fc = (n: number) => formatCurrency(Math.round(n), ccy);

  useEffect(() => { if (restaurant) load(); else setLoading(false); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const [recipesRes, costsRes, profilesRes] = await Promise.all([
      supabase.from("recipes")
        .select("id, name, category, selling_price, kitchen_profile, packaging_channel, recipe_ingredients(quantity, ingredients(unit_price))")
        .eq("restaurant_id", restaurant!.id).order("created_at"),
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

    const rows: RecipeCard[] = (recipesRes.data ?? []).map(r => {
      const foodCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const kProfile = (r as any).kitchen_profile || "medium";
      const pChannel = (r as any).packaging_channel || "dine-in";
      const kitchenLoad = kProfiles[kProfile] ?? defaultKL[kProfile] ?? 1350;
      const packaging = packCosts[pChannel] ?? 0;
      const trueCost = foodCost + kitchenLoad + packaging + washingPP + wasteAlloc + overheadPP;
      const sp = Number(r.selling_price);
      const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : -100;
      const contribution = sp - trueCost;
      const strength: Strength = margin >= 40 ? "strong" : margin >= 20 ? "moderate" : "weak";
      return { id: r.id, name: r.name, category: r.category, selling_price: sp, food_cost: foodCost, true_cost: trueCost, margin, strength, contribution };
    });
    setRecipes(rows);
    setLoading(false);
  };

  const strengthColors: Record<Strength, string> = { strong: "text-success", moderate: "text-warning", weak: "text-destructive" };
  const strengthBgs: Record<Strength, string> = { strong: "bg-success/10", moderate: "bg-warning/10", weak: "bg-destructive/10" };
  const strengthLabels: Record<Strength, string> = {
    strong: isAr ? "قوي" : "Strong",
    moderate: isAr ? "متوسط" : "Moderate",
    weak: isAr ? "ضعيف" : "Weak",
  };
  const strengthIcons: Record<Strength, any> = { strong: TrendingUp, moderate: Minus, weak: TrendingDown };

  const filtered = recipes
    .filter(r => (filterCat === "الكل" || r.category === filterCat))
    .filter(r => filterStrength === "all" || r.strength === filterStrength)
    .filter(r => !search || r.name.includes(search));

  const strong = recipes.filter(r => r.strength === "strong").length;
  const moderate = recipes.filter(r => r.strength === "moderate").length;
  const weak = recipes.filter(r => r.strength === "weak").length;

  if (loading) return <AppLayout><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("menuStudio")}</h1>
            <div className="flex gap-4 mt-1 text-sm">
              <span className="flex items-center gap-1 text-success"><TrendingUp className="w-3.5 h-3.5" />{strong} {isAr ? "قوي" : "Strong"}</span>
              <span className="flex items-center gap-1 text-warning"><Minus className="w-3.5 h-3.5" />{moderate} {isAr ? "متوسط" : "Moderate"}</span>
              <span className="flex items-center gap-1 text-destructive"><TrendingDown className="w-3.5 h-3.5" />{weak} {isAr ? "ضعيف" : "Weak"}</span>
            </div>
          </div>
          <Button asChild className="rounded-xl"><Link to="/app/menu-studio/recipes/new"><Plus className="w-4 h-4 me-2" />{t("newRecipe")}</Link></Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search")} className="ps-9 rounded-xl" />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterStrength} onValueChange={setFilterStrength}>
            <SelectTrigger className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
              <SelectItem value="strong">{isAr ? "قوي" : "Strong"}</SelectItem>
              <SelectItem value="moderate">{isAr ? "متوسط" : "Moderate"}</SelectItem>
              <SelectItem value="weak">{isAr ? "ضعيف" : "Weak"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recipe Grid */}
        {filtered.length === 0 ? (
          <Card className="rounded-2xl"><CardContent className="py-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{recipes.length === 0 ? (isAr ? "لم تنشئ وصفات بعد — ابدأ بإنشاء أول وصفة" : "No recipes yet — create your first recipe") : t("noData")}</p>
            {recipes.length === 0 && (
              <Button asChild className="mt-4 rounded-xl"><Link to="/app/menu-studio/recipes/new"><Plus className="w-4 h-4 me-2" />{t("newRecipe")}</Link></Button>
            )}
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => {
              const Icon = strengthIcons[r.strength];
              return (
                <Link key={r.id} to={`/app/menu-studio/recipes/${r.id}`}>
                  <Card className="shadow-card rounded-2xl hover:shadow-card-hover transition-all cursor-pointer h-full">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{r.name}</h3>
                          <p className="text-xs text-muted-foreground">{r.category}</p>
                        </div>
                        <Badge className={`${strengthBgs[r.strength]} ${strengthColors[r.strength]} border-0 text-xs`}>
                          <Icon className="w-3 h-3 me-1" />{strengthLabels[r.strength]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">{t("sellingPrice")}:</span><br /><span className="font-semibold">{fc(r.selling_price)}</span></div>
                        <div><span className="text-muted-foreground">{t("trueCost")}:</span><br /><span className="font-semibold">{fc(r.true_cost)}</span></div>
                        <div><span className="text-muted-foreground">{t("foodCost")}:</span><br /><span className="font-semibold">{fc(r.food_cost)}</span></div>
                        <div><span className="text-muted-foreground">{t("margin")}:</span><br /><span className={`font-extrabold ${strengthColors[r.strength]}`}>{r.margin.toFixed(0)}%</span></div>
                      </div>
                      {r.margin < 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-lg p-2">
                          <AlertTriangle className="w-3.5 h-3.5" />{isAr ? "خسارة — يجب مراجعة السعر" : "Loss maker — review pricing"}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
