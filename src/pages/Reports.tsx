import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, DollarSign, Swords, Package, Gift, FileText, Crown } from "lucide-react";

export default function Reports() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const reports = [
    { titleKey: "costMarginReport", desc: isAr ? "تحليل تفصيلي لتكاليف الأطباق وهوامش الربح مع التكلفة الحقيقية الكاملة" : "Detailed dish cost and margin analysis with full true cost breakdown", icon: DollarSign, plan: "pro" },
    { titleKey: "ingredientSpikeReport", desc: isAr ? "تأثير ارتفاع أسعار المكونات على هوامش الأطباق والإجراءات المقترحة" : "Impact of ingredient price spikes on dish margins with suggested actions", icon: Package, plan: "pro" },
    { titleKey: "competitionReport", desc: isAr ? "مقارنة أسعارك مع متوسط السوق ومؤشر التسعير" : "Compare your prices with market average and pricing index", icon: Swords, plan: "pro" },
    { titleKey: "pricingReport", desc: isAr ? "فرص تحسين الأسعار — أطباق يمكن رفع أو خفض أسعارها" : "Pricing improvement opportunities — dishes to adjust up or down", icon: DollarSign, plan: "elite" },
    { titleKey: "promotionReport", desc: isAr ? "فرص العروض الترويجية بناءً على الهوامش والمنافسة" : "Promotion opportunities based on margins and competition", icon: Gift, plan: "elite" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">{t("reports")}</h1>
          <p className="text-sm text-muted-foreground">{isAr ? "تقارير تحليلية مع إجراءات مقترحة" : "Analytical reports with suggested actions"}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r, i) => (
            <Card key={i} className="hover:shadow-card-hover transition-shadow rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><r.icon className="w-5 h-5 text-primary" /></div>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary"><Crown className="w-3 h-3 me-1" />{t(r.plan)}</Badge>
                </div>
                <h4 className="font-bold text-sm mb-1">{t(r.titleKey)}</h4>
                <p className="text-xs text-muted-foreground mb-4">{r.desc}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg"><FileText className="w-3.5 h-3.5 me-1" />PDF</Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg"><BarChart3 className="w-3.5 h-3.5 me-1" />Excel</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
