import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockRecommendations } from "@/lib/mock-data";
import { Check, X, Clock, Sparkles, Crown } from "lucide-react";

const typeIcons: Record<string, string> = { IncreasePrice: "💰", Promote: "📣", Remove: "🗑️", Investigate: "🔍", SupplierChange: "🔄", CostReduction: "✂️" };

export default function Recommendations() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [tab, setTab] = useState("new");
  const filtered = mockRecommendations.filter(r => r.status === tab);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("recommendations")}</h3>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary"><Crown className="w-3 h-3 me-1" />{t("elite")}</Badge>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList><TabsTrigger value="new">{isAr ? "جديد" : "New"} ({mockRecommendations.filter(r=>r.status==="new").length})</TabsTrigger><TabsTrigger value="snoozed">{isAr ? "مؤجل" : "Snoozed"}</TabsTrigger><TabsTrigger value="approved">{isAr ? "مُعتمد" : "Approved"}</TabsTrigger><TabsTrigger value="dismissed">{isAr ? "مرفوض" : "Dismissed"}</TabsTrigger></TabsList>
          <TabsContent value={tab} className="mt-4 space-y-3">
            {filtered.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">{t("noData")}</p></CardContent></Card>
            ) : filtered.map(rec => (
              <Card key={rec.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-lg">{typeIcons[rec.type] || "💡"}</span>
                        <Badge variant="outline" className="text-[10px]">{rec.type}</Badge>
                        <span className="text-xs text-muted-foreground">{isAr ? "ثقة" : "conf"}: {rec.confidence}%</span>
                        <span className="text-xs text-muted-foreground">{rec.createdAt}</span>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                      <p className="text-xs text-success mt-1 font-medium">{rec.impact}</p>
                    </div>
                    {tab === "new" && (
                      <div className="flex flex-col gap-1.5">
                        <Button size="sm" className="h-8 bg-success/20 text-success hover:bg-success/30 border-0"><Check className="w-3.5 h-3.5 me-1" />{t("approve")}</Button>
                        <Button size="sm" variant="outline" className="h-8"><Clock className="w-3.5 h-3.5 me-1" />{t("snooze")}</Button>
                        <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30"><X className="w-3.5 h-3.5 me-1" />{t("dismiss")}</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
