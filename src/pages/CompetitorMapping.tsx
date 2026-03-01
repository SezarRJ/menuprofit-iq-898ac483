import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockRecipes, mockCompetitors } from "@/lib/mock-data";
import { ArrowLeftRight } from "lucide-react";

export default function CompetitorMapping() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const mappings = [
    { own: "كباب لحم", competitor: "كباب لحم", competitorName: "مطعم الشرق", score: 98 },
    { own: "شاورما دجاج", competitor: "شاورما دجاج", competitorName: "مطعم الشرق", score: 95 },
    { own: "برياني دجاج", competitor: "برياني دجاج", competitorName: "مطعم الشرق", score: 92 },
    { own: "فلافل (6 حبات)", competitor: "فلافل", competitorName: "مطعم النخيل", score: 85 },
  ];
  return (
    <AppLayout>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("competitorMapping")}</h3>
        <div className="space-y-3">
          {mappings.map((m, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4 flex items-center gap-4">
                <div className="flex-1 text-end"><p className="font-medium text-sm">{m.own}</p><p className="text-xs text-muted-foreground">{isAr ? "طبقك" : "Your dish"}</p></div>
                <div className="flex flex-col items-center gap-1">
                  <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
                  <Badge variant={m.score > 90 ? "default" : "outline"} className={m.score > 90 ? "bg-success/20 text-success border-0 text-[10px]" : "text-warning border-warning/30 text-[10px]"}>{m.score}%</Badge>
                </div>
                <div className="flex-1"><p className="font-medium text-sm">{m.competitor}</p><p className="text-xs text-muted-foreground">{m.competitorName}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
