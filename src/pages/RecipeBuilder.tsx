import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Trash2, AlertTriangle, Save, Flame, Package as PackageIcon, Droplets, Recycle, Calculator } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface RecipeLine { ingredientId: string; name: string; qty: number; unit: string; unitPrice: number; yieldPct: number; wastePct: number; }
interface Ingredient { id: string; name: string; unit: string; unit_price: number; yield_pct?: number; waste_pct?: number; }

const categories = ["شاورما", "برغر", "بيتزا", "مشويات", "سلطات", "مشروبات", "حلويات", "أطباق رئيسية", "مقبلات", "عام"];

export default function RecipeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(!!id);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("عام");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [kitchenProfile, setKitchenProfile] = useState("medium");
  const [packagingChannel, setPackagingChannel] = useState("dine-in");
  const [lines, setLines] = useState<RecipeLine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Kitchen Cost Engine settings from restaurant
  const packagingCosts: Record<string, number> = {
    "dine-in": (restaurant as any)?.packaging_dinein ?? 0,
    "takeaway": (restaurant as any)?.packaging_takeaway ?? 500,
    "delivery": (restaurant as any)?.packaging_delivery ?? 1000,
  };
  const washingPerPlate = (restaurant as any)?.washing_per_plate ?? 200;
  const monthlyWaste = (restaurant as any)?.monthly_waste_budget ?? 0;
  const baselinePlates = (restaurant as any)?.baseline_plates ?? 6000;

  const [kitchenProfiles, setKitchenProfiles] = useState<Record<string, { energy: number; labor: number; equipment: number }>>({
    light: { energy: 200, labor: 300, equipment: 100 },
    medium: { energy: 500, labor: 600, equipment: 250 },
    heavy: { energy: 1000, labor: 1000, equipment: 500 },
  });
  const [overheadPerPlate, setOverheadPerPlate] = useState(0);

  useEffect(() => {
    if (restaurant) {
      loadIngredients();
      loadKitchenProfiles();
      loadOverhead();
      if (id) loadRecipe();
    } else {
      setLoading(false);
    }
  }, [restaurant, id]);

  const loadIngredients = async () => {
    const { data } = await supabase.from("ingredients").select("id, name, unit, unit_price, yield_pct, waste_pct").eq("restaurant_id", restaurant!.id).order("name");
    setIngredients((data ?? []) as Ingredient[]);
  };

  const loadKitchenProfiles = async () => {
    const { data } = await supabase.from("kitchen_profiles").select("*").eq("restaurant_id", restaurant!.id);
    if (data && data.length > 0) {
      const profiles: Record<string, { energy: number; labor: number; equipment: number }> = {};
      data.forEach((p: any) => {
        profiles[p.profile_type] = { energy: Number(p.energy_cost), labor: Number(p.labor_cost), equipment: Number(p.equipment_cost) };
      });
      setKitchenProfiles(prev => ({ ...prev, ...profiles }));
    }
  };

  const loadOverhead = async () => {
    const { data } = await supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant!.id);
    const total = (data ?? []).reduce((s, c) => s + Number(c.monthly_amount), 0);
    setOverheadPerPlate(baselinePlates > 0 ? total / baselinePlates : 0);
  };

  const loadRecipe = async () => {
    setLoading(true);
    const { data } = await supabase.from("recipes")
      .select("*, recipe_ingredients(id, quantity, ingredient_id, ingredients(id, name, unit, unit_price, yield_pct, waste_pct))")
      .eq("id", id!).single();
    if (data) {
      setName(data.name);
      setCategory(data.category);
      setSellingPrice(Number(data.selling_price));
      setKitchenProfile((data as any).kitchen_profile || "medium");
      setPackagingChannel((data as any).packaging_channel || "dine-in");
      setLines((data.recipe_ingredients ?? []).map((ri: any) => ({
        ingredientId: ri.ingredient_id,
        name: ri.ingredients?.name || "",
        qty: Number(ri.quantity),
        unit: ri.ingredients?.unit || "",
        unitPrice: Number(ri.ingredients?.unit_price ?? 0),
        yieldPct: Number(ri.ingredients?.yield_pct ?? 100),
        wastePct: Number(ri.ingredients?.waste_pct ?? 0),
      })));
    }
    setLoading(false);
  };

  const filteredIngredients = ingredients.filter(i => !searchTerm || i.name.includes(searchTerm));
  const addIngredient = (ing: Ingredient) => {
    if (lines.find(l => l.ingredientId === ing.id)) return;
    setLines([...lines, {
      ingredientId: ing.id, name: ing.name, qty: 1, unit: ing.unit,
      unitPrice: ing.unit_price, yieldPct: ing.yield_pct ?? 100, wastePct: ing.waste_pct ?? 0,
    }]);
  };
  const updateQty = (idx: number, qty: number) => {
    const nl = [...lines]; nl[idx].qty = qty; setLines(nl);
  };
  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  // ========= SMART KITCHEN COST ENGINE =========
  const directCost = lines.reduce((s, l) => {
    const effectivePrice = l.yieldPct > 0 ? l.unitPrice / (l.yieldPct / 100) : l.unitPrice;
    return s + l.qty * effectivePrice;
  }, 0);

  const profile = kitchenProfiles[kitchenProfile] || kitchenProfiles.medium;
  const kitchenLoadCost = profile.energy + profile.labor + profile.equipment;
  const packaging = packagingCosts[packagingChannel] || 0;
  const washing = washingPerPlate;
  const wasteAllocation = baselinePlates > 0 ? monthlyWaste / baselinePlates : 0;
  const overhead = overheadPerPlate;

  const trueCost = directCost + kitchenLoadCost + packaging + washing + wasteAllocation + overhead;
  const margin = sellingPrice > 0 ? ((sellingPrice - trueCost) / sellingPrice * 100) : 0;
  const contribution = sellingPrice - trueCost;
  const strength = margin >= 40 ? "strong" : margin >= 20 ? "moderate" : "weak";
  const strengthColor = { strong: "text-success", moderate: "text-warning", weak: "text-destructive" }[strength];
  const strengthLabel = { strong: isAr ? "قوي" : "Strong", moderate: isAr ? "متوسط" : "Moderate", weak: isAr ? "ضعيف" : "Weak" }[strength];

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  const handleSave = async () => {
    if (!restaurant || !name) return;
    const recipeData: any = {
      name, category, selling_price: sellingPrice,
      kitchen_profile: kitchenProfile, packaging_channel: packagingChannel,
    };

    let recipeId = id;
    if (id) {
      await supabase.from("recipes").update(recipeData).eq("id", id);
      await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
    } else {
      recipeData.restaurant_id = restaurant.id;
      const { data } = await supabase.from("recipes").insert(recipeData).select("id").single();
      recipeId = data?.id;
    }

    if (recipeId && lines.length > 0) {
      await supabase.from("recipe_ingredients").insert(
        lines.map(l => ({ recipe_id: recipeId!, ingredient_id: l.ingredientId, quantity: l.qty }))
      );
    }

    toast.success(isAr ? "تم الحفظ" : "Saved");
    navigate("/app/menu-studio/recipes");
  };

  if (loading) return <AppLayout><Skeleton className="h-96 rounded-2xl" /></AppLayout>;

  const costBreakdown = [
    { label: t("directCost"), value: directCost, icon: PackageIcon, color: "text-foreground" },
    { label: t("kitchenLoad"), value: kitchenLoadCost, icon: Flame, color: "text-warning" },
    { label: t("packagingCost"), value: packaging, icon: PackageIcon, color: "text-muted-foreground" },
    { label: t("washingCost"), value: washing, icon: Droplets, color: "text-primary" },
    { label: t("wasteCost"), value: wasteAllocation, icon: Recycle, color: "text-destructive" },
    { label: t("overheadAllocation"), value: overhead, icon: Calculator, color: "text-muted-foreground" },
  ];

  return (
    <AppLayout>
      <div className="grid lg:grid-cols-[260px_1fr_300px] gap-4 items-start">
        {/* Left: Ingredient Picker */}
        <Card className="sticky top-20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t("ingredients")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="relative">
              <Search className="absolute start-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t("search")} className="ps-8 h-9 text-sm" />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {filteredIngredients.map(ing => (
                <button key={ing.id} onClick={() => addIngredient(ing)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-start"
                  disabled={!!lines.find(l => l.ingredientId === ing.id)}>
                  <span className={lines.find(l => l.ingredientId === ing.id) ? "text-muted-foreground" : ""}>{ing.name}</span>
                  <span className="text-xs text-muted-foreground">{ing.unit_price.toLocaleString()}/{ing.unit}</span>
                </button>
              ))}
              {filteredIngredients.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">{t("noData")}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Center: Recipe Form */}
        <Card>
          <CardHeader><CardTitle className="text-base">{id ? (isAr ? "تعديل الوصفة" : "Edit Recipe") : (isAr ? "وصفة جديدة" : "New Recipe")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">{t("name")}</label><Input value={name} onChange={e => setName(e.target.value)} placeholder={isAr ? "اسم الطبق" : "Dish name"} /></div>
              <div><label className="text-sm font-medium mb-1 block">{t("category")}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-medium mb-1 block">{t("sellingPrice")} ({currency})</label><Input type="number" value={sellingPrice || ""} onChange={e => setSellingPrice(Number(e.target.value))} dir="ltr" /></div>
              <div><label className="text-sm font-medium mb-1 block">{t("kitchenProfile")}</label>
                <Select value={kitchenProfile} onValueChange={setKitchenProfile}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("lightCook")}</SelectItem>
                    <SelectItem value="medium">{t("mediumCook")}</SelectItem>
                    <SelectItem value="heavy">{t("heavyCook")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">{t("packagingChannel")}</label>
                <Select value={packagingChannel} onValueChange={setPackagingChannel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in">{t("dineIn")}</SelectItem>
                    <SelectItem value="takeaway">{t("takeaway")}</SelectItem>
                    <SelectItem value="delivery">{t("delivery")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">{isAr ? "مكونات الوصفة" : "Recipe Ingredients"}</h4>
              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">{isAr ? "اختر مكونات من القائمة" : "Select ingredients from the list"}</p>
              ) : (
                <div className="space-y-2">
                  {lines.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm font-medium">{l.name}</span>
                      <Input type="number" value={l.qty} onChange={e => updateQty(i, Number(e.target.value))} className="w-20 h-8 text-sm" dir="ltr" step="0.01" />
                      <span className="text-xs text-muted-foreground w-10">{l.unit}</span>
                      <span className="text-xs font-medium w-20 text-end">{(l.qty * (l.yieldPct > 0 ? l.unitPrice / (l.yieldPct / 100) : l.unitPrice)).toLocaleString()}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLine(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleSave} disabled={!name} className="w-full gradient-primary border-0"><Save className="w-4 h-4 me-2" />{t("save")}</Button>
          </CardContent>
        </Card>

        {/* Right: Smart Kitchen Cost Engine Panel */}
        <Card className="sticky top-20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-warning" />
              {isAr ? "محرك التكلفة الذكي" : "Smart Cost Engine"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Cost Breakdown */}
            <div className="space-y-1.5">
              {costBreakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value.toFixed(0)} {currency}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-border">
                <span>{t("trueCost")}</span>
                <span>{trueCost.toFixed(0)} {currency}</span>
              </div>
            </div>

            {/* Margin Gauge */}
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("margin")}</p>
              <p className={`text-3xl font-extrabold ${strengthColor}`}>{margin.toFixed(1)}%</p>
              <Badge variant="outline" className={`mt-2 text-xs ${strengthColor}`}>{strengthLabel}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{isAr ? "المساهمة" : "Contribution"}</span>
              <span className={`font-bold ${contribution < 0 ? "text-destructive" : "text-success"}`}>{contribution.toFixed(0)} {currency}</span>
            </div>

            {sellingPrice > 0 && sellingPrice < trueCost && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">{isAr ? "سعر البيع أقل من التكلفة الحقيقية!" : "Selling price is below true cost!"}</p>
              </div>
            )}

            {/* Cost Formula */}
            <div className="text-[10px] text-muted-foreground/50 bg-muted/30 rounded-lg p-2 leading-relaxed">
              {isAr ? "التكلفة = مباشرة + حمل مطبخ + تغليف + غسيل + هدر + مصاريف" : "True Cost = Direct + Kitchen Load + Packaging + Washing + Waste + Overhead"}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
