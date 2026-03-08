import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, ArrowRight, Sparkles, Building2, Package, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

const steps = [
  { icon: Building2, labelAr: "إعداد المطعم", labelEn: "Restaurant Setup" },
  { icon: Package, labelAr: "أول مكونات", labelEn: "First Ingredients" },
  { icon: UtensilsCrossed, labelAr: "أول وصفة", labelEn: "First Recipe" },
  { icon: Sparkles, labelAr: "التكلفة الحقيقية!", labelEn: "True Cost!" },
];

const sampleIngredients = [
  { name: "صدر دجاج", unit: "كغم", price: 8500 },
  { name: "لحم بقر مفروم", unit: "كغم", price: 18000 },
  { name: "طماطم", unit: "كغم", price: 2000 },
  { name: "بصل", unit: "كغم", price: 1500 },
  { name: "أرز بسمتي", unit: "كغم", price: 4500 },
  { name: "زيت زيتون", unit: "لتر", price: 12000 },
  { name: "خبز صمون", unit: "قطعة", price: 250 },
  { name: "بهارات مشكلة", unit: "كغم", price: 25000 },
];

export default function Onboarding() {
  const { user, refreshRestaurant } = useRestaurant();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  // Step 1: Restaurant
  const [restName, setRestName] = useState("");
  const [city, setCity] = useState("بغداد");
  const [currency, setCurrency] = useState("IQD");
  const [targetMargin, setTargetMargin] = useState("45");

  // Step 2: Ingredients
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([0, 1, 2, 3]);

  // Step 3: Recipe
  const [recipeName, setRecipeName] = useState("");
  const [recipePrice, setRecipePrice] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState<{ idx: number; qty: number }[]>([
    { idx: 0, qty: 0.25 },
    { idx: 3, qty: 0.05 },
  ]);

  const ccy = currency === "USD" ? "$" : "د.ع";

  const handleCreateRestaurant = async () => {
    if (!user || !restName) return;
    setSaving(true);
    const { data, error } = await supabase.from("restaurants").insert({
      owner_id: user.id,
      name: restName,
      city,
      default_currency: currency,
      target_margin_pct: Number(targetMargin),
    }).select("id").single();

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    // Create default kitchen profiles
    const rid = data.id;
    await supabase.from("kitchen_profiles").insert([
      { restaurant_id: rid, profile_type: "light", energy_cost: 200, labor_cost: 300, equipment_cost: 100 },
      { restaurant_id: rid, profile_type: "medium", energy_cost: 500, labor_cost: 600, equipment_cost: 250 },
      { restaurant_id: rid, profile_type: "heavy", energy_cost: 1000, labor_cost: 1000, equipment_cost: 500 },
    ]);

    await refreshRestaurant();
    setSaving(false);
    setStep(1);
  };

  const handleAddIngredients = async () => {
    const { data: rest } = await supabase.from("restaurants").select("id").eq("owner_id", user!.id).maybeSingle();
    if (!rest) return;
    setSaving(true);

    const ingredients = selectedIngredients.map(i => ({
      restaurant_id: rest.id,
      name: sampleIngredients[i].name,
      unit: sampleIngredients[i].unit,
      unit_price: sampleIngredients[i].price,
    }));

    await supabase.from("ingredients").insert(ingredients);
    setSaving(false);
    setStep(2);
  };

  const handleCreateRecipe = async () => {
    const { data: rest } = await supabase.from("restaurants").select("id").eq("owner_id", user!.id).maybeSingle();
    if (!rest || !recipeName || !recipePrice) return;
    setSaving(true);

    const { data: recipe } = await supabase.from("recipes").insert({
      restaurant_id: rest.id,
      name: recipeName,
      selling_price: Number(recipePrice),
      category: "عام",
    }).select("id").single();

    if (recipe && recipeIngredients.length > 0) {
      const { data: ings } = await supabase.from("ingredients").select("id, name").eq("restaurant_id", rest.id);
      if (ings) {
        const links = recipeIngredients.map(ri => {
          const ingName = sampleIngredients[ri.idx]?.name;
          const dbIng = ings.find(i => i.name === ingName);
          return dbIng ? { recipe_id: recipe.id, ingredient_id: dbIng.id, quantity: ri.qty } : null;
        }).filter(Boolean);
        if (links.length > 0) await supabase.from("recipe_ingredients").insert(links as any);
      }
    }

    setSaving(false);
    setStep(3);
  };

  const handleFinish = async () => {
    await refreshRestaurant();
    navigate("/app/dashboard");
  };

  // Calculate preview true cost in step 3
  const directCost = recipeIngredients.reduce((s, ri) => {
    const ing = sampleIngredients[ri.idx];
    return s + (ing ? ri.qty * ing.price : 0);
  }, 0);
  const kitchenLoad = 1350; // medium default
  const previewTrueCost = directCost + kitchenLoad + 200; // + washing
  const previewMargin = Number(recipePrice) > 0 ? ((Number(recipePrice) - previewTrueCost) / Number(recipePrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        {/* Brand */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary">SMARTMENU</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr ? "ابدأ بإعداد مطعمك في دقائق" : "Set up your restaurant in minutes"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-success text-success-foreground" :
                i === step ? "gradient-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-xs hidden sm:inline text-muted-foreground">{isAr ? s.labelAr : s.labelEn}</span>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="shadow-card rounded-2xl">
          <CardContent className="pt-6 space-y-4">
            {step === 0 && (
              <>
                <h2 className="text-lg font-bold">{isAr ? "أخبرنا عن مطعمك" : "Tell us about your restaurant"}</h2>
                <div>
                  <label className="text-sm font-medium mb-1 block">{isAr ? "اسم المطعم" : "Restaurant Name"}</label>
                  <Input value={restName} onChange={e => setRestName(e.target.value)} placeholder={isAr ? "مثال: مطعم الوردة" : "e.g. Al-Warda Restaurant"} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{isAr ? "المدينة" : "City"}</label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["بغداد", "الموصل", "أربيل", "البصرة", "النجف", "كربلاء"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{isAr ? "العملة" : "Currency"}</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IQD">IQD (د.ع)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{isAr ? "هامش الربح المستهدف %" : "Target Margin %"}</label>
                  <Input type="number" value={targetMargin} onChange={e => setTargetMargin(e.target.value)} dir="ltr" />
                </div>
                <Button onClick={handleCreateRestaurant} disabled={saving || !restName} className="w-full gradient-primary border-0 rounded-xl">
                  {saving ? (isAr ? "جاري الإنشاء..." : "Creating...") : (isAr ? "التالي" : "Next")} <Arrow className="w-4 h-4 ms-2" />
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-lg font-bold">{isAr ? "اختر المكونات الأساسية" : "Select starter ingredients"}</h2>
                <p className="text-sm text-muted-foreground">{isAr ? "يمكنك إضافة المزيد لاحقاً" : "You can add more later"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {sampleIngredients.map((ing, i) => {
                    const selected = selectedIngredients.includes(i);
                    return (
                      <button key={i} onClick={() => setSelectedIngredients(prev => selected ? prev.filter(x => x !== i) : [...prev, i])}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 border text-sm transition-all ${
                          selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                        }`}>
                        <span>{ing.name}</span>
                        <span className="text-xs text-muted-foreground">{ing.price.toLocaleString()} {ccy}</span>
                      </button>
                    );
                  })}
                </div>
                <Button onClick={handleAddIngredients} disabled={saving || selectedIngredients.length === 0} className="w-full gradient-primary border-0 rounded-xl">
                  {saving ? (isAr ? "جاري الإضافة..." : "Adding...") : `${isAr ? "أضف" : "Add"} ${selectedIngredients.length} ${isAr ? "مكونات" : "ingredients"}`} <Arrow className="w-4 h-4 ms-2" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-bold">{isAr ? "أنشئ أول وصفة" : "Create your first recipe"}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{isAr ? "اسم الطبق" : "Dish Name"}</label>
                    <Input value={recipeName} onChange={e => setRecipeName(e.target.value)} placeholder={isAr ? "مثال: كباب لحم" : "e.g. Lamb Kebab"} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{isAr ? "سعر البيع" : "Selling Price"} ({ccy})</label>
                    <Input type="number" value={recipePrice} onChange={e => setRecipePrice(e.target.value)} dir="ltr" placeholder="15000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isAr ? "المكونات" : "Ingredients"}</label>
                  {recipeIngredients.map((ri, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm">{sampleIngredients[ri.idx]?.name}</span>
                      <Input type="number" value={ri.qty} onChange={e => {
                        const updated = [...recipeIngredients];
                        updated[i].qty = Number(e.target.value);
                        setRecipeIngredients(updated);
                      }} className="w-20 h-8 text-sm" dir="ltr" step="0.01" />
                      <span className="text-xs text-muted-foreground">{sampleIngredients[ri.idx]?.unit}</span>
                    </div>
                  ))}
                  <Select onValueChange={v => setRecipeIngredients(prev => [...prev, { idx: Number(v), qty: 0.1 }])}>
                    <SelectTrigger className="h-8 text-sm rounded-lg"><SelectValue placeholder={isAr ? "+ مكون" : "+ Add"} /></SelectTrigger>
                    <SelectContent>
                      {selectedIngredients.filter(i => !recipeIngredients.find(ri => ri.idx === i)).map(i => (
                        <SelectItem key={i} value={String(i)}>{sampleIngredients[i].name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Live cost preview */}
                {Number(recipePrice) > 0 && (
                  <div className="bg-muted rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{isAr ? "تكلفة مباشرة" : "Direct Cost"}</span>
                      <span className="font-medium">{directCost.toLocaleString()} {ccy}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
                      <span>{isAr ? "التكلفة الحقيقية (تقريبي)" : "True Cost (est.)"}</span>
                      <span>{previewTrueCost.toLocaleString()} {ccy}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{isAr ? "الهامش" : "Margin"}</span>
                      <span className={`font-extrabold ${previewMargin >= 40 ? "text-success" : previewMargin >= 20 ? "text-warning" : "text-destructive"}`}>
                        {previewMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                <Button onClick={handleCreateRecipe} disabled={saving || !recipeName || !recipePrice} className="w-full gradient-primary border-0 rounded-xl">
                  {saving ? (isAr ? "جاري الإنشاء..." : "Creating...") : (isAr ? "إنشاء الوصفة" : "Create Recipe")} <Arrow className="w-4 h-4 ms-2" />
                </Button>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-xl font-extrabold">{isAr ? "ممتاز! مطعمك جاهز 🎉" : "Awesome! You're all set 🎉"}</h2>
                <p className="text-sm text-muted-foreground">
                  {isAr
                    ? "يمكنك الآن رؤية التكلفة الحقيقية لأطباقك، توليد أسعار ذكية، وإنشاء عروض مربحة."
                    : "You can now see the true cost of your dishes, generate smart pricing, and create profitable promotions."}
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-2xl font-extrabold text-primary">{selectedIngredients.length}</p>
                    <p className="text-xs text-muted-foreground">{isAr ? "مكونات" : "Ingredients"}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-2xl font-extrabold text-success">1</p>
                    <p className="text-xs text-muted-foreground">{isAr ? "وصفة" : "Recipe"}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className={`text-2xl font-extrabold ${previewMargin >= 40 ? "text-success" : previewMargin >= 20 ? "text-warning" : "text-destructive"}`}>
                      {previewMargin.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{isAr ? "هامش" : "Margin"}</p>
                  </div>
                </div>
                <Button onClick={handleFinish} className="w-full gradient-primary border-0 rounded-xl text-lg py-6">
                  {isAr ? "انطلق إلى لوحة التحكم" : "Go to Dashboard"} <Arrow className="w-5 h-5 ms-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
