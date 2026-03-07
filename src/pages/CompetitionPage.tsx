import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Swords, TrendingUp, TrendingDown, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Competitor { id: string; name: string; location: string; tier: string; }
interface CompPrice { id: string; competitor_name: string; price: number; recipe_id: string; recipe_name?: string; note: string; }
interface Recipe { id: string; name: string; selling_price: number; }

export default function CompetitionPage() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(true);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [prices, setPrices] = useState<CompPrice[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [openComp, setOpenComp] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const [compName, setCompName] = useState("");
  const [compLocation, setCompLocation] = useState("");
  const [compTier, setCompTier] = useState("mid-range");
  const [pCompName, setPCompName] = useState("");
  const [pRecipeId, setPRecipeId] = useState("");
  const [pPrice, setPPrice] = useState("");

  useEffect(() => { if (restaurant) load(); else setLoading(false); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const [compRes, priceRes, recRes] = await Promise.all([
      supabase.from("competitors").select("*").eq("restaurant_id", restaurant!.id).order("created_at"),
      supabase.from("competitor_prices").select("*, recipes!inner(name, restaurant_id)").eq("recipes.restaurant_id", restaurant!.id),
      supabase.from("recipes").select("id, name, selling_price").eq("restaurant_id", restaurant!.id),
    ]);
    setCompetitors((compRes.data ?? []) as Competitor[]);
    setPrices((priceRes.data ?? []).map((p: any) => ({ ...p, recipe_name: p.recipes?.name })));
    setRecipes(recRes.data ?? []);
    setLoading(false);
  };

  const addCompetitor = async () => {
    if (!restaurant || !compName) return;
    await supabase.from("competitors").insert({ restaurant_id: restaurant.id, name: compName, location: compLocation, tier: compTier });
    toast.success(isAr ? "تم الإضافة" : "Added");
    setCompName(""); setCompLocation(""); setOpenComp(false); load();
  };

  const addPrice = async () => {
    if (!pCompName || !pRecipeId || !pPrice) return;
    await supabase.from("competitor_prices").insert({ competitor_name: pCompName, recipe_id: pRecipeId, price: Number(pPrice) });
    toast.success(isAr ? "تم الإضافة" : "Added");
    setPCompName(""); setPRecipeId(""); setPPrice(""); setOpenPrice(false); load();
  };

  const deleteComp = async (id: string) => {
    await supabase.from("competitors").delete().eq("id", id);
    toast.success(isAr ? "تم الحذف" : "Deleted"); load();
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  // Price index calculation
  const priceIndexMap = new Map<string, { myPrice: number; avgComp: number; count: number }>();
  prices.forEach(p => {
    const recipe = recipes.find(r => r.id === p.recipe_id);
    if (!recipe) return;
    const existing = priceIndexMap.get(p.recipe_id) || { myPrice: Number(recipe.selling_price), avgComp: 0, count: 0 };
    existing.avgComp += Number(p.price);
    existing.count++;
    priceIndexMap.set(p.recipe_id, existing);
  });

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("competition")}</h1>
            <p className="text-sm text-muted-foreground">{isAr ? "تتبع أسعار المنافسين ومقارنتها" : "Track and benchmark competitor prices"}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={openComp} onOpenChange={setOpenComp}>
              <DialogTrigger asChild><Button variant="outline" className="rounded-xl"><Plus className="w-4 h-4 me-2" />{isAr ? "منافس" : "Competitor"}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{isAr ? "إضافة منافس" : "Add Competitor"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>{t("name")}</Label><Input value={compName} onChange={e => setCompName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>{isAr ? "الموقع" : "Location"}</Label><Input value={compLocation} onChange={e => setCompLocation(e.target.value)} /></div>
                  <div className="space-y-2"><Label>{isAr ? "المستوى" : "Tier"}</Label>
                    <Select value={compTier} onValueChange={setCompTier}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">{isAr ? "اقتصادي" : "Budget"}</SelectItem>
                        <SelectItem value="mid-range">{isAr ? "متوسط" : "Mid-range"}</SelectItem>
                        <SelectItem value="premium">{isAr ? "راقي" : "Premium"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addCompetitor} className="w-full rounded-xl">{t("save")}</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={openPrice} onOpenChange={setOpenPrice}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 me-2" />{isAr ? "سعر" : "Price"}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{isAr ? "إضافة سعر منافس" : "Add Competitor Price"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>{isAr ? "اسم المنافس" : "Competitor"}</Label><Input value={pCompName} onChange={e => setPCompName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>{isAr ? "الطبق" : "Recipe"}</Label>
                    <Select value={pRecipeId} onValueChange={setPRecipeId}>
                      <SelectTrigger><SelectValue placeholder={isAr ? "اختر" : "Select"} /></SelectTrigger>
                      <SelectContent>{recipes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t("price")} ({currency})</Label><Input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} dir="ltr" /></div>
                  <Button onClick={addPrice} className="w-full rounded-xl">{t("save")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Price Index Cards */}
        {priceIndexMap.size > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(priceIndexMap.entries()).map(([recipeId, data]) => {
              const recipe = recipes.find(r => r.id === recipeId);
              if (!recipe) return null;
              const avgComp = data.count > 0 ? data.avgComp / data.count : 0;
              const index = avgComp > 0 ? (data.myPrice / avgComp * 100) : 100;
              const status = index > 115 ? "overpriced" : index < 85 ? "underpriced" : "competitive";
              const StatusIcon = status === "overpriced" ? TrendingUp : status === "underpriced" ? TrendingDown : Minus;
              const statusColor = status === "overpriced" ? "text-destructive" : status === "underpriced" ? "text-warning" : "text-success";
              return (
                <Card key={recipeId} className="shadow-card rounded-2xl">
                  <CardContent className="pt-5">
                    <h3 className="font-semibold text-sm mb-2">{recipe.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div><span className="text-muted-foreground">{isAr ? "سعرك" : "Your Price"}</span><br /><span className="font-bold">{data.myPrice.toLocaleString()} {currency}</span></div>
                      <div><span className="text-muted-foreground">{t("marketAverage")}</span><br /><span className="font-bold">{avgComp.toFixed(0)} {currency}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                      <span className={`text-sm font-bold ${statusColor}`}>{t("priceIndex")}: {index.toFixed(0)}%</span>
                      <Badge variant="outline" className={`text-[10px] ${statusColor}`}>{t(status)}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Competitors List */}
        <Card className="shadow-card rounded-2xl">
          <CardHeader><CardTitle className="text-base">{t("competitors")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{isAr ? "الموقع" : "Location"}</TableHead>
                  <TableHead>{isAr ? "المستوى" : "Tier"}</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.location}</TableCell>
                    <TableCell><Badge variant="outline">{c.tier}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => deleteComp(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
                {competitors.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">
                    <Swords className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{isAr ? "أضف منافسين لمقارنة الأسعار" : "Add competitors to benchmark prices"}</p>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Competitor Prices */}
        {prices.length > 0 && (
          <Card className="shadow-card rounded-2xl">
            <CardHeader><CardTitle className="text-base">{isAr ? "أسعار المنافسين" : "Competitor Prices"}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "المنافس" : "Competitor"}</TableHead>
                    <TableHead>{isAr ? "الطبق" : "Recipe"}</TableHead>
                    <TableHead>{t("price")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.competitor_name}</TableCell>
                      <TableCell>{p.recipe_name}</TableCell>
                      <TableCell>{Number(p.price).toLocaleString()} {currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
