import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, Crown } from "lucide-react";

export default function SettingsRestaurant() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h3 className="text-lg font-semibold">{t("restaurant")}</h3>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Crown className="w-4 h-4 text-primary" />{isAr ? "الخطة الحالية" : "Current Plan"}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4"><Badge className="gradient-primary border-0 text-sm px-3 py-1">{t("elite")}</Badge><span className="text-sm text-muted-foreground">{isAr ? "50,000 د.ع/شهر" : "$39/mo"}</span></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm"><span>{isAr ? "المكونات" : "Ingredients"}</span><span className="text-muted-foreground">10 / ∞</span></div>
              <Progress value={10} className="h-2" />
              <div className="flex items-center justify-between text-sm"><span>{isAr ? "الوصفات" : "Recipes"}</span><span className="text-muted-foreground">8 / ∞</span></div>
              <Progress value={8} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" />{isAr ? "معلومات المطعم" : "Restaurant Info"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">{isAr ? "اسم المطعم" : "Name"}</label><Input defaultValue="مطعم الوردة" /></div>
            <div><label className="text-sm font-medium mb-1 block">{isAr ? "العملة" : "Currency"}</label>
              <Select defaultValue="IQD"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IQD">{isAr ? "دينار عراقي" : "IQD"}</SelectItem><SelectItem value="USD">{isAr ? "دولار أمريكي" : "USD"}</SelectItem></SelectContent></Select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">{isAr ? "هامش الربح المستهدف %" : "Target Margin %"}</label><Input type="number" defaultValue="45" dir="ltr" /></div>
            <div><label className="text-sm font-medium mb-1 block">{isAr ? "حد الهامش الأدنى %" : "Min Margin Floor %"}</label><Input type="number" defaultValue="20" dir="ltr" /></div>
            <div><label className="text-sm font-medium mb-1 block">{isAr ? "عدد الأطباق الأساسي" : "Baseline Plates"}</label><Input type="number" defaultValue="6000" dir="ltr" /></div>
            <Button className="gradient-primary border-0"><Save className="w-4 h-4 me-2" />{t("save")}</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
