import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UtensilsCrossed, Search, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const categories = ["الكل", "شاورما", "برغر", "بيتزا", "مشويات", "سلطات", "مشروبات", "حلويات", "عام"];

interface RecipeCard {
  id: string; name: string; category: string; selling_price: number;
  food_cost: number; true_cost: number; margin: number; status: string;
}

export default function MenuStudioRecipes() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [recipes, setRecipes] = useState<RecipeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("الكل");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { if (restaurant) load(); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const { data: recs } = await supabase
      .from("recipes")
      .select("id, name, category, selling_price, recipe_ingredients(quantity, ingredients(unit_price))")
      .eq("restaurant_id", restaurant!.id).order("created_at");

    const { data: costs } = await supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant!.id);
    const totalOp = costs?.reduce((s, c) => s + Number(c.monthly_amount), 0) ?? 0;
    const overhead = totalOp / Math.max(recs?.length ?? 1, 1);
    const target = restaurant!.target_margin_pct;

    const rows: RecipeCard[] = (recs ?? []).map(r => {
      const foodCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const trueCost = foodCost + overhead;
      const sp = Number(r.selling_price);
      const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : -100;
      const status = margin < 0 ? "lossMaker" : margin < 15 ? "critical" : margin < target ? "belowTarget" : "healthy";
      return { id: r.id, name: r.name, category: r.category, selling_price: sp, food_cost: foodCost, true_cost: trueCost, margin, status };
    });
    setRecipes(rows);
    setLoading(false);
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";
  const statusColors: Record<string, string> = { healthy: "text-success", belowTarget: "text-warning", critical: "text-destructive", lossMaker: "text-destructive" };
  const statusBgs: Record<string, string> = { healthy: "bg-success/10", belowTarget: "bg-warning/10", critical: "bg-destructive/10", lossMaker: "bg-destructive/10" };

  const filtered = recipes
    .filter(r => (filterCat === "الكل" || r.category === filterCat))
    .filter(r => filterStatus === "all" || r.status === filterStatus)
    .filter(r => !search || r.name.includes(search));

  const strong = recipes.filter(r => r.margin >= 40).length;
  const weak = recipes.filter(r => r.margin < 20).length;

  if (loading) return <AppLayout><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("menuStudio")}</h1>
            <div className="flex gap-4 mt-1 text-sm">
              <span className="flex items-center gap-1 text-success"><TrendingUp className="w-3.5 h-3.5" />{strong} {isAr ? "قوي" : "strong"}</span>
              <span className="flex items-center gap-1 text-destructive"><TrendingDown className="w-3.5 h-3.5" />{weak} {isAr ? "ضعيف" : "weak"}</span>
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
            <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
              <SelectItem value="healthy">{t("healthy")}</SelectItem>
              <SelectItem value="belowTarget">{t("belowTarget")}</SelectItem>
              <SelectItem value="critical">{t("critical")}</SelectItem>
              <SelectItem value="lossMaker">{t("lossMaker")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recipe Grid */}
        {filtered.length === 0 ? (
          <Card className="rounded-2xl"><CardContent className="py-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("noData")}</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => (
              <Link key={r.id} to={`/app/menu-studio/recipes/${r.id}`}>
                <Card className="shadow-card rounded-2xl hover:shadow-card-hover transition-all cursor-pointer">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{r.name}</h3>
                        <p className="text-xs text-muted-foreground">{r.category}</p>
                      </div>
                      <Badge className={`${statusBgs[r.status]} ${statusColors[r.status]} border-0 text-xs`}>{t(r.status)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">{t("sellingPrice")}:</span><br /><span className="font-semibold">{r.selling_price.toLocaleString()} {currency}</span></div>
                      <div><span className="text-muted-foreground">{t("trueCost")}:</span><br /><span className="font-semibold">{r.true_cost.toFixed(0)} {currency}</span></div>
                      <div><span className="text-muted-foreground">{t("foodCost")}:</span><br /><span className="font-semibold">{r.food_cost.toFixed(0)} {currency}</span></div>
                      <div><span className="text-muted-foreground">{t("margin")}:</span><br /><span className={`font-extrabold ${statusColors[r.status]}`}>{r.margin.toFixed(0)}%</span></div>
                    </div>
                    {r.margin < 0 && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-lg p-2">
                        <AlertTriangle className="w-3.5 h-3.5" />{isAr ? "خسارة — يجب مراجعة السعر" : "Loss maker — review pricing"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
