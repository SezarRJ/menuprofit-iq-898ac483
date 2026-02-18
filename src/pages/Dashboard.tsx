import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Plus, FileSpreadsheet, UtensilsCrossed, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, ResponsiveContainer } from "recharts";

interface DishProfit {
  name: string;
  profit: number;
  margin: number;
}

interface DashboardData {
  totalDishes: number;
  avgMargin: number;
  monthlyBreakeven: number;
  topDishes: DishProfit[];
  marginChartData: { name: string; margin: number }[];
  costDistribution: { name: string; value: number }[];
  weeklySales: { week: string; quantity: number; revenue: number }[];
}

const CHART_COLORS = [
  "hsl(170, 55%, 35%)",
  "hsl(40, 85%, 55%)",
  "hsl(210, 70%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(155, 60%, 40%)",
  "hsl(280, 50%, 50%)",
];

export default function Dashboard() {
  const { restaurant } = useRestaurant();
  const [data, setData] = useState<DashboardData>({
    totalDishes: 0, avgMargin: 0, monthlyBreakeven: 0, topDishes: [],
    marginChartData: [], costDistribution: [], weeklySales: [],
  });

  useEffect(() => {
    if (!restaurant) return;
    loadDashboard();
  }, [restaurant]);

  const loadDashboard = async () => {
    if (!restaurant) return;

    const [recipesRes, costsRes, salesRes] = await Promise.all([
      supabase
        .from("recipes")
        .select("id, name, selling_price, recipe_ingredients(quantity, ingredients(unit_price))")
        .eq("restaurant_id", restaurant.id),
      supabase
        .from("operating_costs")
        .select("name, monthly_amount, cost_type")
        .eq("restaurant_id", restaurant.id),
      supabase
        .from("sales_rows")
        .select("quantity, sale_date, matched_recipe_id, sales_imports!inner(restaurant_id)")
        .eq("sales_imports.restaurant_id", restaurant.id),
    ]);

    const recipes = recipesRes.data;
    const costs = costsRes.data;
    const sales = salesRes.data;

    const totalOpCost = costs?.reduce((s, c) => s + Number(c.monthly_amount), 0) ?? 0;
    const totalDishes = recipes?.length ?? 0;

    // Cost distribution for pie chart
    const costDistribution: { name: string; value: number }[] = [];
    if (costs && costs.length > 0) {
      const grouped: Record<string, number> = {};
      costs.forEach((c) => {
        const key = c.cost_type || c.name;
        grouped[key] = (grouped[key] || 0) + Number(c.monthly_amount);
      });
      Object.entries(grouped).forEach(([name, value]) => costDistribution.push({ name, value }));
    }

    if (!recipes || totalDishes === 0) {
      setData({ totalDishes: 0, avgMargin: 0, monthlyBreakeven: 0, topDishes: [], marginChartData: [], costDistribution, weeklySales: [] });
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
      return { name: r.name, profit, margin };
    });

    const avgMargin = dishProfits.reduce((s, d) => s + d.margin, 0) / totalDishes;
    const avgProfit = dishProfits.reduce((s, d) => s + d.profit, 0) / totalDishes;
    const monthlyBreakeven = avgProfit > 0 ? Math.ceil(totalOpCost / avgProfit) : 0;
    const topDishes = [...dishProfits].sort((a, b) => b.profit - a.profit).slice(0, 5);
    const marginChartData = [...dishProfits].sort((a, b) => b.margin - a.margin).slice(0, 8).map(d => ({
      name: d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name,
      margin: Math.round(d.margin),
    }));

    // Weekly sales aggregation
    const weeklySales: { week: string; quantity: number; revenue: number }[] = [];
    if (sales && sales.length > 0) {
      const recipeMap = new Map(recipes.map(r => [r.id, Number(r.selling_price)]));
      const weekMap: Record<string, { quantity: number; revenue: number }> = {};
      sales.forEach((s) => {
        if (!s.sale_date) return;
        const d = new Date(s.sale_date);
        const weekStart = new Date(d);
        // Saturday-based week (Iraq market)
        const daysSinceSaturday = (d.getDay() + 1) % 7;
        weekStart.setDate(d.getDate() - daysSinceSaturday);
        const key = weekStart.toISOString().slice(5, 10);
        if (!weekMap[key]) weekMap[key] = { quantity: 0, revenue: 0 };
        weekMap[key].quantity += Number(s.quantity);
        weekMap[key].revenue += Number(s.quantity) * (recipeMap.get(s.matched_recipe_id ?? "") ?? 0);
      });
      Object.entries(weekMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8)
        .forEach(([week, v]) => weeklySales.push({ week, ...v }));
    }

    setData({ totalDishes, avgMargin: Math.round(avgMargin), monthlyBreakeven, topDishes, marginChartData, costDistribution, weeklySales });
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  const marginConfig = { margin: { label: "هامش الربح %", color: "hsl(170, 55%, 35%)" } };
  const salesConfig = {
    quantity: { label: "الكمية", color: "hsl(170, 55%, 35%)" },
    revenue: { label: "الإيرادات", color: "hsl(40, 85%, 55%)" },
  };

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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Profit Margins Bar Chart */}
          {data.marginChartData.length > 0 && (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  هوامش الربح حسب الطبق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={marginConfig} className="h-[260px] w-full">
                  <BarChart data={data.marginChartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="margin" fill="hsl(170, 55%, 35%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Cost Distribution Pie Chart */}
          {data.costDistribution.length > 0 && (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">توزيع المصاريف التشغيلية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.costDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.costDistribution.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Weekly Sales Line Chart */}
        {data.weeklySales.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">المبيعات الأسبوعية</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={salesConfig} className="h-[280px] w-full">
                <LineChart data={data.weeklySales} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="qty" orientation="right" />
                  <YAxis yAxisId="rev" orientation="left" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line yAxisId="qty" type="monotone" dataKey="quantity" stroke="hsl(170, 55%, 35%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke="hsl(40, 85%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

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
