import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const categories = ["شاورما", "برغر", "بيتزا", "مشويات", "سلطات", "مشروبات", "حلويات", "عام"];

interface Ingredient { id: string; name: string; unit: string; unit_price: number; }

interface RecipeRow {
  id: string; name: string; category: string; selling_price: number;
  ingredient_cost: number; overhead: number; true_cost: number; margin: number;
}

export default function Recipes() {
  const { restaurant } = useRestaurant();
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [open, setOpen] = useState(!!searchParams.get("add"));

  // Form state
  const [dishName, setDishName] = useState("");
  const [category, setCategory] = useState("عام");
  const [sellingPrice, setSellingPrice] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState<{ ingredient_id: string; quantity: string }[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [selectedQty, setSelectedQty] = useState("");

  useEffect(() => { if (restaurant) { load(); loadIngredients(); } }, [restaurant]);

  const loadIngredients = async () => {
    const { data } = await supabase.from("ingredients").select("*").eq("restaurant_id", restaurant!.id);
    setIngredients(data ?? []);
  };

  const load = async () => {
    const { data: recs } = await supabase
      .from("recipes")
      .select("id, name, category, selling_price, recipe_ingredients(quantity, ingredients(unit_price))")
      .eq("restaurant_id", restaurant!.id)
      .order("created_at");

    const { data: costs } = await supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant!.id);
    const totalOp = costs?.reduce((s, c) => s + Number(c.monthly_amount), 0) ?? 0;
    const totalRecipes = recs?.length ?? 1;
    const overhead = totalOp / totalRecipes;

    const rows: RecipeRow[] = (recs ?? []).map(r => {
      const ingCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const trueCost = ingCost + overhead;
      const sp = Number(r.selling_price);
      const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : 0;
      return { id: r.id, name: r.name, category: r.category, selling_price: sp, ingredient_cost: ingCost, overhead, true_cost: trueCost, margin };
    });

    setRecipes(rows);
  };

  const addIngredientToList = () => {
    if (!selectedIngredient || !selectedQty) return;
    setRecipeIngredients([...recipeIngredients, { ingredient_id: selectedIngredient, quantity: selectedQty }]);
    setSelectedIngredient(""); setSelectedQty("");
  };

  const removeFromList = (idx: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== idx));
  };

  const currentIngredientCost = recipeIngredients.reduce((s, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredient_id);
    return s + (Number(ri.quantity) * Number(ing?.unit_price ?? 0));
  }, 0);

  const handleSave = async () => {
    if (!restaurant || !dishName) return;
    const { data: recipe, error } = await supabase.from("recipes").insert({
      restaurant_id: restaurant.id, name: dishName, category, selling_price: Number(sellingPrice) || 0,
    }).select("id").single();

    if (error || !recipe) { toast.error(error?.message ?? "خطأ"); return; }

    if (recipeIngredients.length > 0) {
      await supabase.from("recipe_ingredients").insert(
        recipeIngredients.map(ri => ({ recipe_id: recipe.id, ingredient_id: ri.ingredient_id, quantity: Number(ri.quantity) }))
      );
    }
    toast.success("تم حفظ الوصفة");
    setDishName(""); setCategory("عام"); setSellingPrice(""); setRecipeIngredients([]); setOpen(false);
    load();
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">الوصفات</h1>
          <Dialog open={open} onOpenChange={v => { if (!v) { setOpen(false); setDishName(""); setCategory("عام"); setSellingPrice(""); setRecipeIngredients([]); } else setOpen(true); }}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 ml-2" />إضافة وصفة جديدة</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>إضافة وصفة جديدة</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>اسم الصحن</Label><Input value={dishName} onChange={e => setDishName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>سعر البيع ({currency})</Label><Input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} dir="ltr" className="text-left" step="0.01" /></div>

                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">المكونات</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="المادة" /></SelectTrigger>
                      <SelectContent>{ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" placeholder="الكمية" value={selectedQty} onChange={e => setSelectedQty(e.target.value)} className="w-24 text-left" dir="ltr" step="0.01" />
                    <Button type="button" variant="outline" onClick={addIngredientToList}>إضافة</Button>
                  </div>

                  {recipeIngredients.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {recipeIngredients.map((ri, idx) => {
                        const ing = ingredients.find(i => i.id === ri.ingredient_id);
                        return (
                          <div key={idx} className="flex items-center justify-between bg-muted rounded-md px-3 py-2 text-sm">
                            <span>{ing?.name} — {ri.quantity} {ing?.unit}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeFromList(idx)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-muted rounded-lg p-3 text-sm">
                  تكلفة المكونات الحالية: <span className="font-bold">{currentIngredientCost.toFixed(2)}{currency}</span>
                </div>

                <Button onClick={handleSave} className="w-full">حفظ الوصفة</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصحن</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>التكلفة الحقيقية</TableHead>
                  <TableHead>الهامش</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map(r => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link to={`/recipes/${r.id}`} className="font-medium text-primary hover:underline">{r.name}</Link>
                    </TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>{r.true_cost.toFixed(2)}{currency}</TableCell>
                    <TableCell>
                      <span className={r.margin >= 30 ? "text-success" : r.margin >= 15 ? "text-warning" : "text-destructive"}>
                        {r.margin.toFixed(0)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {recipes.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">لا توجد وصفات بعد</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
