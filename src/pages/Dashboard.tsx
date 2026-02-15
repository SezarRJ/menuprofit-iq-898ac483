import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet, UtensilsCrossed, Package, TrendingUp } from "lucide-react";

interface DashboardData {
  totalDishes: number;
  avgMargin: number;
  monthlyBreakeven: number;
  topDishes: { name: string; profit: number }[];
}

export default function Dashboard() {
  const { restaurant } = useRestaurant();
  const [data, setData] = useState<DashboardData>({
    totalDishes: 0, avgMargin: 0, monthlyBreakeven: 0, topDishes: [],
  });

  useEffect(() => {
    if (!restaurant) return;
    loadDashboard();
  }, [restaurant]);

  const loadDashboard = async () => {
    if (!restaurant) return;

    // Fetch recipes with their ingredients
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id, name, selling_price, recipe_ingredients(quantity, ingredients(unit_price))")
      .eq("restaurant_id", restaurant.id);

    const { data: costs } = await supabase
      .from("operating_costs")
      .select("monthly_amount")
      .eq("restaurant_id", restaurant.id);

    const totalOpCost = costs?.reduce((s, c) => s + Number(c.monthly_amount), 0) ?? 0;
    const totalDishes = recipes?.length ?? 0;

    if (!recipes || totalDishes === 0) {
      setData({ totalDishes: 0, avgMargin: 0, monthlyBreakeven: 0, topDishes: [] });
      return;
    }

    const overheadPerDish = totalDishes > 0 ? totalOpCost / totalDishes : 0;

    const dishProfits = recipes.map((r) => {
      const ingredientCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const trueCost = ingredientCost + overheadPerDish;
      const profit = Number(r.selling_price) - trueCost;
      const margin = Number(r.selling_price) > 0 ? (profit / Number(r.selling_price)) * 100 : 0;
      return { name: r.name, profit, margin, trueCost, sellingPrice: Number(r.selling_price) };
    });

    const avgMargin = dishProfits.reduce((s, d) => s + d.margin, 0) / totalDishes;
    const avgProfit = dishProfits.reduce((s, d) => s + d.profit, 0) / totalDishes;
    const monthlyBreakeven = avgProfit > 0 ? Math.ceil(totalOpCost / avgProfit) : 0;

    const topDishes = [...dishProfits].sort((a, b) => b.profit - a.profit).slice(0, 5);

    setData({ totalDishes, avgMargin: Math.round(avgMargin), monthlyBreakeven, topDishes });
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">إجمالي الأطباق</p>
              <p className="text-3xl font-bold mt-1">{data.totalDishes}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">متوسط هامش الربح</p>
              <p className="text-3xl font-bold mt-1">{data.avgMargin}%</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">نقطة التعادل الشهرية</p>
              <p className="text-3xl font-bold mt-1">{data.monthlyBreakeven.toLocaleString()} طبق</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild><Link to="/ingredients?add=1"><Plus className="w-4 h-4 ml-2" />إضافة مادة خام</Link></Button>
          <Button asChild variant="outline"><Link to="/recipes?add=1"><UtensilsCrossed className="w-4 h-4 ml-2" />إضافة وصفة</Link></Button>
          <Button asChild variant="outline"><Link to="/sales"><FileSpreadsheet className="w-4 h-4 ml-2" />استيراد المبيعات</Link></Button>
        </div>

        {/* Top Dishes */}
        {data.topDishes.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                أكثر الأطباق ربحاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topDishes.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-primary font-bold">{d.profit.toFixed(2)}{currency}</span>
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
