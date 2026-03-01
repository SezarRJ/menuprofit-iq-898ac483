import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCompetitors } from "@/lib/mock-data";
import { Plus, MapPin, Crown } from "lucide-react";

const tierColors: Record<string,string> = { premium: "bg-warning/15 text-warning", "mid-range": "bg-primary/15 text-primary", budget: "bg-muted text-muted-foreground" };

export default function Competitors() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{t("competitors")}</h3><Button size="sm" className="gradient-primary border-0"><Plus className="w-4 h-4 me-1.5" />{t("add")}</Button></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCompetitors.map(c => (
            <Card key={c.id} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold">{c.name}</h3>
                  <Badge variant="outline" className={tierColors[c.tier] || ""}>{c.tier}</Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3"><MapPin className="w-3.5 h-3.5" />{c.location}</p>
                <p className="text-sm">{c.items.length} {isAr ? "صنف مُتتبع" : "items tracked"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
