import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Trash2, Package, DollarSign, Truck, AlertTriangle, Check, Clock, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Recommendation {
  id: string; type: string; title: string; reasoning: string;
  impact: string; confidence: number; target_item: string | null; status: string;
  created_at: string;
}

const typeIcons: Record<string, any> = {
  IncreasePrice: DollarSign, Promote: TrendingUp, Remove: Trash2,
  Investigate: AlertTriangle, SupplierChange: Truck, CostReduction: Package,
};
const typeColors: Record<string, string> = {
  IncreasePrice: "bg-warning/10 text-warning", Promote: "bg-success/10 text-success",
  Remove: "bg-destructive/10 text-destructive", Investigate: "bg-warning/10 text-warning",
  SupplierChange: "bg-primary/10 text-primary", CostReduction: "bg-success/10 text-success",
};

export default function AIRecommendations() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("new");
  const [generating, setGenerating] = useState(false);

  useEffect(() => { if (restaurant) load(); else setLoading(false); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("ai_recommendations").select("*").eq("restaurant_id", restaurant!.id).order("created_at", { ascending: false });
    setItems((data ?? []) as Recommendation[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("ai_recommendations").update({ status }).eq("id", id);
    if (status === "approved") {
      const rec = items.find(r => r.id === id);
      if (rec) {
        await supabase.from("actions").insert({
          restaurant_id: restaurant!.id,
          title: rec.title,
          type: rec.type,
          priority: rec.confidence >= 80 ? "high" : rec.confidence >= 50 ? "medium" : "low",
          recommendation_id: rec.id,
        });
      }
    }
    toast.success(isAr ? "تم التحديث" : "Updated");
    load();
  };

  const generateRecommendations = async () => {
    if (!restaurant) return;
    setGenerating(true);
    try {
      // Analyze recipes for recommendations
      const { data: recipes } = await supabase
        .from("recipes")
        .select("name, selling_price, recipe_ingredients(quantity, ingredients(unit_price, name))")
        .eq("restaurant_id", restaurant.id);

      const { data: costs } = await supabase.from("operating_costs").select("monthly_amount").eq("restaurant_id", restaurant.id);
      const totalOp = (costs ?? []).reduce((s, c) => s + Number(c.monthly_amount), 0);
      const baseline = (restaurant as any).baseline_plates || 6000;
      const overhead = baseline > 0 ? totalOp / baseline : 0;

      const recommendations: any[] = [];
      (recipes ?? []).forEach(r => {
        const foodCost = r.recipe_ingredients?.reduce(
          (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
        ) ?? 0;
        const trueCost = foodCost + overhead;
        const sp = Number(r.selling_price);
        const margin = sp > 0 ? ((sp - trueCost) / sp) * 100 : -100;

        if (margin < 0) {
          recommendations.push({
            restaurant_id: restaurant.id, type: "Remove", title: isAr ? `إزالة ${r.name} من القائمة` : `Remove ${r.name} from menu`,
            reasoning: isAr ? `الطبق يعمل بخسارة (هامش ${margin.toFixed(0)}%)` : `Dish is a loss maker (${margin.toFixed(0)}% margin)`,
            impact: isAr ? `إيقاف الخسارة في هذا الطبق` : `Stop losses on this dish`,
            confidence: 90, target_item: r.name, status: "new",
          });
        } else if (margin < 20) {
          recommendations.push({
            restaurant_id: restaurant.id, type: "IncreasePrice", title: isAr ? `رفع سعر ${r.name}` : `Increase ${r.name} price`,
            reasoning: isAr ? `هامش الربح ${margin.toFixed(0)}% أقل من الحد الأدنى 20%` : `Margin ${margin.toFixed(0)}% is below minimum 20%`,
            impact: isAr ? `تحسين الهامش إلى مستوى آمن` : `Improve margin to safe level`,
            confidence: 85, target_item: r.name, status: "new",
          });
        } else if (margin > 60) {
          recommendations.push({
            restaurant_id: restaurant.id, type: "Promote", title: isAr ? `ترويج ${r.name}` : `Promote ${r.name}`,
            reasoning: isAr ? `هامش ربح عالي ${margin.toFixed(0)}% — يمكن تقديم خصم آمن` : `High margin ${margin.toFixed(0)}% — safe to offer discounts`,
            impact: isAr ? `زيادة المبيعات مع الحفاظ على الربحية` : `Increase sales while maintaining profitability`,
            confidence: 70, target_item: r.name, status: "new",
          });
        }
      });

      if (recommendations.length > 0) {
        await supabase.from("ai_recommendations").insert(recommendations);
        toast.success(isAr ? `تم توليد ${recommendations.length} توصيات` : `Generated ${recommendations.length} recommendations`);
      } else {
        toast.info(isAr ? "لا توجد توصيات جديدة" : "No new recommendations");
      }
      load();
    } catch {
      toast.error(isAr ? "خطأ في التحليل" : "Analysis error");
    }
    setGenerating(false);
  };

  const filtered = items.filter(r => r.status === tab);

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("aiRecommendations")}</h1>
            <p className="text-sm text-muted-foreground">{isAr ? "توصيات ذكية لتحسين الأرباح" : "Smart recommendations to optimize profits"}</p>
          </div>
          <Button onClick={generateRecommendations} disabled={generating} className="rounded-xl gradient-primary border-0">
            <Sparkles className="w-4 h-4 me-2" />
            {generating ? (isAr ? "جاري التحليل..." : "Analyzing...") : (isAr ? "تحليل وتوليد" : "Analyze & Generate")}
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="new" className="rounded-lg">{isAr ? "جديد" : "New"} ({items.filter(r => r.status === "new").length})</TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg">{t("approve")} ({items.filter(r => r.status === "approved").length})</TabsTrigger>
            <TabsTrigger value="snoozed" className="rounded-lg">{t("snooze")} ({items.filter(r => r.status === "snoozed").length})</TabsTrigger>
            <TabsTrigger value="dismissed" className="rounded-lg">{t("dismiss")} ({items.filter(r => r.status === "dismissed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {filtered.length === 0 ? (
              <Card className="rounded-2xl"><CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{isAr ? "لا توجد توصيات — اضغط 'تحليل وتوليد'" : "No recommendations — click 'Analyze & Generate'"}</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {filtered.map(rec => {
                  const Icon = typeIcons[rec.type] || Brain;
                  return (
                    <Card key={rec.id} className="shadow-card rounded-2xl">
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl ${typeColors[rec.type] || "bg-muted"} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm">{rec.title}</h3>
                              <Badge variant="outline" className="text-[10px]">{rec.type}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${rec.confidence >= 80 ? "text-success" : rec.confidence >= 50 ? "text-warning" : "text-muted-foreground"}`}>
                                {rec.confidence}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{rec.reasoning}</p>
                            <p className="text-xs text-success">{rec.impact}</p>

                            {tab === "new" && (
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" className="rounded-lg" onClick={() => updateStatus(rec.id, "approved")}>
                                  <Check className="w-3.5 h-3.5 me-1" />{t("approve")}
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => updateStatus(rec.id, "snoozed")}>
                                  <Clock className="w-3.5 h-3.5 me-1" />{t("snooze")}
                                </Button>
                                <Button size="sm" variant="ghost" className="rounded-lg text-destructive" onClick={() => updateStatus(rec.id, "dismissed")}>
                                  <X className="w-3.5 h-3.5 me-1" />{t("dismiss")}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
