import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockRisk } from "@/lib/mock-data";
import { AlertTriangle, TrendingUp, Crown, Shield, Package, PieChart } from "lucide-react";

export default function RiskRadar() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const scoreColor = mockRisk.overallScore < 30 ? "text-success" : mockRisk.overallScore < 60 ? "text-warning" : "text-destructive";
  const scoreBg = mockRisk.overallScore < 30 ? "bg-success/10" : mockRisk.overallScore < 60 ? "bg-warning/10" : "bg-destructive/10";

  const riskComponents = [
    { label: isAr ? "مخاطر الهامش" : "Margin Risk", value: mockRisk.marginRisk, icon: PieChart },
    { label: isAr ? "مخاطر المكونات" : "Ingredient Risk", value: mockRisk.ingredientRisk, icon: Package },
    { label: isAr ? "مخاطر التركيز" : "Concentration Risk", value: mockRisk.concentrationRisk, icon: TrendingUp },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold">{t("riskRadar")}</h3>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary"><Crown className="w-3 h-3 me-1" />{t("elite")}</Badge>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className={`w-24 h-24 rounded-full ${scoreBg} flex items-center justify-center mx-auto mb-3`}>
                <span className={`text-4xl font-extrabold ${scoreColor}`}>{mockRisk.overallScore}</span>
              </div>
              <p className="font-medium">{t("riskScore")}</p>
              <p className="text-xs text-muted-foreground">{isAr ? "من 100" : "out of 100"}</p>
              <div className="flex justify-center gap-1 mt-3">
                {mockRisk.trend.map((v, i) => (
                  <div key={i} className="w-6 bg-muted rounded-sm overflow-hidden" style={{ height: 40 }}>
                    <div className={`w-full ${v < 30 ? "bg-success" : v < 60 ? "bg-warning" : "bg-destructive"} rounded-sm`} style={{ height: `${v}%`, marginTop: `${100 - v}%` }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {riskComponents.map((rc, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <rc.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{rc.label}</span>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${rc.value < 30 ? "bg-success" : rc.value < 60 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${rc.value}%` }} />
                </div>
                <p className={`text-2xl font-extrabold ${rc.value < 30 ? "text-success" : rc.value < 60 ? "text-warning" : "text-destructive"}`}>{rc.value}%</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">{isAr ? "أهم عوامل الخطر" : "Top Risk Factors"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockRisk.topFactors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-destructive/5 rounded-lg px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">{isAr ? "الإجراءات المقترحة" : "Suggested Actions"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockRisk.suggestedActions.map((a, i) => (
                <div key={i} className="flex items-center gap-2 bg-success/5 rounded-lg px-3 py-2.5">
                  <Shield className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm">{a}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
