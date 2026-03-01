import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BarChart3, DollarSign, Swords, Package, FileText, Crown } from "lucide-react";

export default function Reports() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const reports = [
    { title: isAr ? "تقرير التكاليف والهوامش" : "Cost & Margin Report", desc: isAr ? "تحليل تفصيلي لتكاليف الأطباق وهوامش الربح" : "Detailed dish cost and margin analysis", icon: DollarSign, plan: "pro" },
    { title: isAr ? "تقرير المنافسة" : "Competition Report", desc: isAr ? "مقارنة أسعارك مع أسعار السوق" : "Compare your prices with market prices", icon: Swords, plan: "pro" },
    { title: isAr ? "تقرير تأثير ارتفاع المكونات" : "Ingredient Spike Impact", desc: isAr ? "تأثير ارتفاع أسعار المكونات على هوامش الأطباق" : "Impact of ingredient price spikes on margins", icon: Package, plan: "elite" },
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("reports")}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r, i) => (
            <Card key={i} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><r.icon className="w-5 h-5 text-primary" /></div>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary"><Crown className="w-3 h-3 me-1" />{t(r.plan)}</Badge>
                </div>
                <h4 className="font-bold text-sm mb-1">{r.title}</h4>
                <p className="text-xs text-muted-foreground mb-4">{r.desc}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1"><FileText className="w-3.5 h-3.5 me-1" />PDF</Button>
                  <Button variant="outline" size="sm" className="flex-1"><BarChart3 className="w-3.5 h-3.5 me-1" />Excel</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
